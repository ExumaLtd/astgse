"use server";

import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  name:    z.string().min(1, "Name is required").max(100),
  email:   z.string().email("Invalid email address"),
  phone:   z.string().max(30).optional(),
  company: z.string().max(100).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export type ContactFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof schema>, string>>;
};

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
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

  const { name, email, phone, company, message } = parsed.data;

  try {
    await resend.emails.send({
      from:    "ASTGSE Enquiry <noreply@astgse.exuma.co.uk>",
      to:      "jonathon@exuma.co.uk",
      replyTo: email,
      subject: `New enquiry from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#141127;">
          <div style="background:#141127;padding:24px 32px;">
            <img src="https://astgse.exuma.co.uk/images/astgse_Logo_Web_White.svg" alt="AST GSE" height="28" />
          </div>
          <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;">
            <h2 style="margin:0 0 24px;font-size:1.25rem;">New enquiry</h2>
            <table style="width:100%;border-collapse:collapse;font-size:0.9375rem;">
              <tr><td style="padding:8px 0;color:#6b7280;width:100px;">Name</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#141127;">${email}</a></td></tr>
              ${phone   ? `<tr><td style="padding:8px 0;color:#6b7280;">Phone</td><td style="padding:8px 0;">${phone}</td></tr>` : ""}
              ${company ? `<tr><td style="padding:8px 0;color:#6b7280;">Company</td><td style="padding:8px 0;">${company}</td></tr>` : ""}
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="margin:0;font-size:0.9375rem;line-height:1.6;white-space:pre-wrap;">${message}</p>
          </div>
          <div style="padding:16px 32px;font-size:0.75rem;color:#9ca3af;">
            Sent via astgse.exuma.co.uk contact form
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to send message. Please try again." };
  }
}
