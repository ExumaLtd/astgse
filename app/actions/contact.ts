"use server";

import { Resend } from "resend";
import { z } from "zod";
import { createClient } from "next-sanity";
import { LANG_TO_LOCALE } from "@/app/i18n/config";

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
  // Honeypot — silently reject if filled
  if (formData.get("website")) return { success: false };

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

  const tz = (formData.get("timezone") as string | null) ?? "";
  const now = new Date();
  const gmtTime = now.toUTCString();
  const localTime = tz
    ? now.toLocaleString("en-GB", { timeZone: tz, dateStyle: "full", timeStyle: "short" })
    : gmtTime;

  const { name, email, phone, company, message, lang } = parsed.data;

  // Rate limit: max 3 submissions per email per hour
  if (await isRateLimited(email)) {
    return { success: false, error: "rate_limit" };
  }

  const langKey = (lang?.toUpperCase() ?? "EN") as keyof typeof LANG_TO_LOCALE;
  const locale = LANG_TO_LOCALE[langKey] ?? "en";

  // Translate message to English if submitted in another language
  const englishMessage = await toEnglish(message, locale);

  const safeName    = esc(name);
  const safeEmail   = esc(email);
  const safePhone   = phone   ? esc(phone)   : null;
  const safeCompany = company ? esc(company) : null;
  const safeMessage = esc(englishMessage);

  // Save to Sanity and send email in parallel — Sanity save is non-fatal
  const sanityPromise = writeClient.create({
    _type: "contactSubmission",
    name,
    email,
    phone: phone || undefined,
    company: company || undefined,
    message: englishMessage,
    submittedLang: lang?.toUpperCase() ?? "EN",
    timezone: tz || undefined,
    localTime,
    submittedAt: now.toISOString(),
    consentGivenAt: now.toISOString(),
    consentText: "Yes, I give permission to store and process my data. You can find more information in our privacy policy and cookie policy.",
    status: "new",
  }).catch(() => {});

  try {
    const [{ error: sendError }] = await Promise.all([resend.emails.send({
      from:    "ASTGSE Enquiry <noreply@exuma.co.uk>",
      to:      "jonathon@exuma.co.uk",
      replyTo: email,
      subject: `New enquiry from ${safeName}`,
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
              <tr><td style="padding:8px 0;color:#6b7280;">Local time</td><td style="padding:8px 0;">${esc(localTime)}${tz ? ` <span style="color:#6b7280;">(${esc(tz)})</span>` : ""}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">GMT</td><td style="padding:8px 0;">${esc(gmtTime)}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="margin:0;font-size:0.9375rem;line-height:1.6;white-space:pre-wrap;">${safeMessage}</p>
          </div>
          <div style="padding:16px 32px;font-size:0.75rem;color:#9ca3af;">
            Sent via astgse.exuma.co.uk contact form${locale !== "en" ? ` &middot; Submitted in ${lang?.toUpperCase()} &middot; Message auto-translated to English` : ""}
          </div>
        </div>
      `,
    }), sanityPromise]);

    if (sendError) {
      console.error("Resend error:", JSON.stringify(sendError, null, 2));
      return { success: false, error: "send_failed" };
    }

    return { success: true };
  } catch (err) {
    console.error("Resend exception:", JSON.stringify(err, null, 2));
    return { success: false, error: "send_failed" };
  }
}
