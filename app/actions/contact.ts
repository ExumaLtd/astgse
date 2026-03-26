"use server";

import { Resend } from "resend";
import { z } from "zod";
import { createClient } from "next-sanity";
import { headers } from "next/headers";
import { LANG_TO_LOCALE } from "@/app/i18n/config";
import * as Sentry from "@sentry/nextjs";

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "kcmbd43u",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const resend = new Resend(process.env.RESEND_API_KEY);

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// Schema returns error codes — translation happens client-side so errors re-translate on lang switch
const schema = z.object({
  name:    z.string().min(1, "name_required").max(100),
  email:   z.string().email("email_invalid"),
  phone:   z.string().regex(/^[\d+ ]{1,20}$/).refine(v => v.replace(/\D/g, "").length >= 10, "phone_invalid").optional().or(z.literal("")),
  company: z.string().max(100).optional(),
  message: z.string().min(10, "message_short").max(2000),
  lang:    z.string().regex(/^[a-zA-Z]{2,5}$/).optional().default("EN"),
  consent: z.literal("on", { error: "consent_required" }),
});


async function toEnglish(text: string, sourceLang: string): Promise<string> {
  if (!sourceLang || sourceLang === "en") return text;
  // Guard: only translate reasonable lengths to avoid abuse of the translate endpoint
  const truncated = text.slice(0, 500);
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=en&dt=t&q=${encodeURIComponent(truncated)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5_000) });
    if (!res.ok) return text;
    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) return text;
    // If message was longer than 500 chars, append the rest untranslated
    const translated = data[0].map((item: [string]) => item[0]).join("") || truncated;
    return text.length > 500 ? translated + text.slice(500) : translated;
  } catch {
    return text;
  }
}

const CONTINENT_MAP: Record<string, string> = {
  AF: "Africa", AN: "Antarctica", AS: "Asia", EU: "Europe",
  NA: "North America", OC: "Oceania", SA: "South America",
};

async function getLocation(ip: string): Promise<{ display: string; country: string; continent: string }> {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return { display: "", country: "", continent: "" };
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { signal: AbortSignal.timeout(3_000) });
    if (!res.ok) return { display: "", country: "", continent: "" };
    const { city, country_name, continent_code } = await res.json() as { city?: string; country_name?: string; continent_code?: string };
    return {
      display: [city, country_name].filter(Boolean).join(", "),
      country: country_name ?? "",
      continent: CONTINENT_MAP[continent_code ?? ""] ?? "",
    };
  } catch {
    return { display: "", country: "", continent: "" };
  }
}

async function isRateLimited(email: string): Promise<boolean> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const count = await writeClient.fetch<number>(
      `count(*[_type == "contactSubmission" && email == $email && submittedAt > $since])`,
      { email, since: oneHourAgo }
    );
    return count >= 3;
  } catch {
    return false; // fail open — don't block legitimate submissions if check fails
  }
}

export type ContactFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "company" | "message" | "lang" | "consent", string>>;
};

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot — return fake success so bots don't know they were blocked
  if (formData.get("website")) return { success: true };

  // Validate fields first so errors show without a Turnstile round-trip
  const raw = {
    name:    formData.get("name"),
    email:   formData.get("email"),
    phone:   formData.get("phone"),
    company: formData.get("company"),
    message: formData.get("message"),
    lang:    formData.get("lang"),
    consent: formData.get("consent"),
  };

  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {};
    for (const [field, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[field as keyof typeof fieldErrors] = issues?.[0];
    }
    return { success: false, fieldErrors };
  }

  // Turnstile verification (bypassed in development)
  if (process.env.NODE_ENV !== "development") {
    const token = formData.get("cf-turnstile-response") as string | null;
    if (!token) return { success: false, error: "verify_failed" };
    try {
      const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token }),
      });
      const { success: tokenValid } = await verify.json() as { success: boolean };
      if (!tokenValid) return { success: false, error: "verify_failed" };
    } catch {
      return { success: false, error: "verify_failed" };
    }
  }

  const { name, email, phone, company, message, lang } = parsed.data;

  // Rate limit: max 3 submissions per email per hour — checked before any external calls
  if (await isRateLimited(email)) {
    return { success: false, error: "rate_limit" };
  }

  const headersList = await headers();
  const ip = ((headersList.get("x-forwarded-for") ?? "").split(",")[0] ?? "").trim() || headersList.get("x-real-ip") || "";
  const { display: location, country, continent } = await getLocation(ip);

  const tz       = (formData.get("timezone")  as string | null) ?? "";
  const referrer  = (formData.get("referrer")  as string | null) ?? "";
  const utmParams = (formData.get("utmParams") as string | null) ?? "";
  const now = new Date();
  const gmtTime = now.toUTCString();
  const localTime = tz
    ? now.toLocaleString("en-GB", { timeZone: tz, dateStyle: "full", timeStyle: "short" })
    : gmtTime;

  const langKey = (lang?.toUpperCase() ?? "EN") as keyof typeof LANG_TO_LOCALE;
  const locale  = LANG_TO_LOCALE[langKey] ?? "en";

  // Translate message to English if submitted in another language
  const englishMessage = await toEnglish(message, locale);

  const safeName    = esc(name);
  const safeEmail   = esc(email);
  const safePhone   = phone   ? esc(phone)   : null;
  const safeCompany = company ? esc(company) : null;
  const safeMessage = esc(englishMessage);

  // Upsert contact record — non-fatal
  const contactId = `contact-${email.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  const contactPromise = writeClient
    .createIfNotExists({ _id: contactId, _type: "contact", email, firstSeenAt: now.toISOString(), enquiryCount: 0 })
    .then(() => writeClient.patch(contactId).set({ name, phone: phone || undefined, company: company || undefined, lastSeenAt: now.toISOString(), referrer: referrer || undefined, country: country || undefined, continent: continent || undefined }).inc({ enquiryCount: 1 }).commit())
    .catch(() => {});

  // Save to Sanity and send email in parallel — Sanity save is non-fatal
  const sanityPromise = writeClient.create({
    _type: "contactSubmission",
    name,
    email,
    phone: phone || undefined,
    company: company || undefined,
    message: englishMessage,
    messageOriginal: locale !== "en" ? message : undefined,
    submittedLang: lang?.toUpperCase() ?? "EN",
    location: location || undefined,
    referrer: referrer || undefined,
    utmParams: utmParams || undefined,
    timezone: tz || undefined,
    localTime,
    submittedAt: now.toISOString(),
    consentGivenAt: now.toISOString(),
    consentText: "Yes, I give permission to store and process my data. You can find more information in our privacy policy and cookie policy.",
    status: "new",
  }).catch(() => {});

  try {
    const [{ error: sendError }] = await Promise.all([resend.emails.send({
      from:    "ASTGSE <noreply@exuma.co.uk>",
      to:      "jonathon@exuma.co.uk",
      replyTo: email,
      subject: `💬 New website enquiry`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#141127;">
          <div style="background:#141127;padding:24px 32px;">
            <img src="https://astgse.exuma.co.uk/images/astgse_Logo_Web_White.svg" alt="AST GSE" height="28" />
          </div>
          <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;">
            <h2 style="margin:0 0 24px;font-size:1.25rem;">New enquiry</h2>
            <table style="width:100%;border-collapse:collapse;font-size:0.9375rem;">
              <tr><td style="padding:8px 0;color:#6b7280;width:100px;">Name</td><td style="padding:8px 0;font-weight:600;">${safeName}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;"><a href="mailto:${safeEmail}" style="color:#141127;">${safeEmail}</a></td></tr>
              ${safePhone   ? `<tr><td style="padding:8px 0;color:#6b7280;">Phone</td><td style="padding:8px 0;">${safePhone}</td></tr>` : ""}
              ${safeCompany ? `<tr><td style="padding:8px 0;color:#6b7280;">Company</td><td style="padding:8px 0;">${safeCompany}</td></tr>` : ""}
              <tr><td style="padding:8px 0;color:#6b7280;">GMT</td><td style="padding:8px 0;">${esc(gmtTime)}</td></tr>
              ${location ? `<tr><td style="padding:8px 0;color:#6b7280;">Country</td><td style="padding:8px 0;">${esc(location)}</td></tr>` : ""}
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="margin:0;font-size:0.9375rem;line-height:1.6;white-space:pre-wrap;">${safeMessage}</p>
          </div>
          <div style="padding:16px 32px;font-size:0.75rem;color:#9ca3af;">
            Sent via astgse.exuma.co.uk contact form${locale !== "en" ? ` &middot; Submitted in ${lang?.toUpperCase()} &middot; Message auto-translated to English` : ""}
          </div>
        </div>
      `,
    }), sanityPromise, contactPromise]);

    if (sendError) {
      Sentry.captureException(new Error(`Resend error: ${JSON.stringify(sendError)}`));
      return { success: false, error: "send_failed" };
    }

    return { success: true };
  } catch (err) {
    Sentry.captureException(err);
    return { success: false, error: "send_failed" };
  }
}
