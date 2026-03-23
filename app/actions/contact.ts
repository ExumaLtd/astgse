"use server";

import { Resend } from "resend";
import { z } from "zod";
import { createClient } from "next-sanity";

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

const schema = z.object({
  name:    z.string().min(1, "Name is required").max(100),
  email:   z.string().email("Invalid email address"),
  phone:   z.string().regex(/^[\d+ ]{7,20}$/, "Please enter a valid phone number").optional().or(z.literal("")),
  company: z.string().max(100).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  lang:    z.string().optional(),
});

const LANG_TO_LOCALE: Record<string, string> = {
  AR: "ar", ES: "es", FR: "fr", EN: "en",
};

async function toEnglish(text: string, sourceLang: string): Promise<string> {
  if (!sourceLang || sourceLang === "en") return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return text;
    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) return text;
    return data[0].map((item: [string]) => item[0]).join("") || text;
  } catch {
    return text;
  }
}

export type ContactFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof schema>, string>>;
};

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot — silently reject if filled
  if (formData.get("website")) return { success: false };

  // Turnstile verification
  const token = formData.get("cf-turnstile-response") as string | null;
  if (!token) return { success: false, error: "Verification failed. Please try again." };
  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token }),
  });
  const { success: tokenValid } = await verify.json() as { success: boolean };
  if (!tokenValid) return { success: false, error: "Verification failed. Please try again." };

  const raw = {
    name:    formData.get("name"),
    email:   formData.get("email"),
    phone:   formData.get("phone"),
    company: formData.get("company"),
    message: formData.get("message"),
  };

  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {};
    for (const [field, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[field as keyof typeof fieldErrors] = issues?.[0];
    }
    return { success: false, fieldErrors };
  }

  const { name, email, phone, company, message, lang } = parsed.data;
  const locale = LANG_TO_LOCALE[lang?.toUpperCase() ?? "EN"] ?? "en";

  // Translate message to English if submitted in another language
  const englishMessage = await toEnglish(message, locale);

  const safeName    = esc(name);
  const safeEmail   = esc(email);
  const safePhone   = phone   ? esc(phone)   : null;
  const safeCompany = company ? esc(company) : null;
  const safeMessage = esc(englishMessage);

  try {
    // Save to Sanity first — if email fails the submission is not lost
    await writeClient.create({
      _type: "contactSubmission",
      name,
      email,
      phone: phone || undefined,
      company: company || undefined,
      message: englishMessage,
      submittedLang: lang?.toUpperCase() ?? "EN",
      submittedAt: new Date().toISOString(),
      status: "new",
    });
  } catch {
    // Non-fatal — log and continue to send email
  }

  try {
    await resend.emails.send({
      from:    "ASTGSE Enquiry <noreply@astgse.exuma.co.uk>",
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
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="margin:0;font-size:0.9375rem;line-height:1.6;white-space:pre-wrap;">${safeMessage}</p>
          </div>
          <div style="padding:16px 32px;font-size:0.75rem;color:#9ca3af;">
            Sent via astgse.exuma.co.uk contact form${locale !== "en" ? ` &middot; Submitted in ${lang?.toUpperCase()} &middot; Message auto-translated to English` : ""}
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to send message. Please try again." };
  }
}
