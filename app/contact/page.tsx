"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/navigation/Navbar";
import { submitContact, type ContactFormState } from "@/app/actions/contact";
import { Turnstile } from "@marsidev/react-turnstile";

const initial: ContactFormState = { success: false };

type LangCode = "EN" | "AR" | "ES" | "FR";

const CONTACT_UI: Record<LangCode, {
  heading1: string; heading2: string; subtext: string;
  labelName: string; labelEmail: string; labelPhone: string; labelCompany: string; labelMessage: string;
  placeholderName: string; placeholderEmail: string; placeholderCompany: string; placeholderMessage: string;
  send: string; sending: string;
  successHeading: string; successBody: string;
  errorGeneral: string;
}> = {
  EN: {
    heading1: "Get in", heading2: "touch.",
    subtext: "Whether you're looking for a specific piece of equipment, need a maintenance quote, or just want to talk through your options — we're here.",
    labelName: "Name *", labelEmail: "Email *", labelPhone: "Phone", labelCompany: "Company", labelMessage: "Message *",
    placeholderName: "Your name", placeholderEmail: "Your email address", placeholderCompany: "Your company", placeholderMessage: "Tell us what you need...",
    send: "Send message", sending: "Sending…",
    successHeading: "Message sent.", successBody: "We'll be in touch shortly.",
    errorGeneral: "Failed to send message. Please try again.",
  },
  AR: {
    heading1: "تواصل", heading2: "معنا.",
    subtext: "سواء كنت تبحث عن معدات محددة، أو تحتاج إلى عرض أسعار للصيانة، أو تريد فقط مناقشة خياراتك — نحن هنا.",
    labelName: "الاسم *", labelEmail: "البريد الإلكتروني *", labelPhone: "الهاتف", labelCompany: "الشركة", labelMessage: "الرسالة *",
    placeholderName: "اسمك", placeholderEmail: "عنوان بريدك الإلكتروني", placeholderCompany: "شركتك", placeholderMessage: "أخبرنا بما تحتاجه...",
    send: "أرسل رسالة", sending: "جارٍ الإرسال…",
    successHeading: "تم إرسال رسالتك.", successBody: "سنتواصل معك قريباً.",
    errorGeneral: "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.",
  },
  ES: {
    heading1: "Ponte en", heading2: "contacto.",
    subtext: "Si buscas un equipo específico, necesitas un presupuesto de mantenimiento, o simplemente quieres explorar tus opciones — estamos aquí.",
    labelName: "Nombre *", labelEmail: "Correo *", labelPhone: "Teléfono", labelCompany: "Empresa", labelMessage: "Mensaje *",
    placeholderName: "Tu nombre", placeholderEmail: "Tu correo electrónico", placeholderCompany: "Tu empresa", placeholderMessage: "Cuéntanos qué necesitas...",
    send: "Enviar mensaje", sending: "Enviando…",
    successHeading: "Mensaje enviado.", successBody: "Nos pondremos en contacto pronto.",
    errorGeneral: "Error al enviar el mensaje. Por favor, inténtalo de nuevo.",
  },
  FR: {
    heading1: "Entrer en", heading2: "contact.",
    subtext: "Que vous recherchiez un équipement spécifique, ayez besoin d'un devis de maintenance, ou souhaitiez simplement discuter de vos options — nous sommes là.",
    labelName: "Nom *", labelEmail: "Email *", labelPhone: "Téléphone", labelCompany: "Entreprise", labelMessage: "Message *",
    placeholderName: "Votre nom", placeholderEmail: "Votre adresse email", placeholderCompany: "Votre entreprise", placeholderMessage: "Dites-nous ce dont vous avez besoin...",
    send: "Envoyer le message", sending: "Envoi en cours…",
    successHeading: "Message envoyé.", successBody: "Nous vous répondrons sous peu.",
    errorGeneral: "Échec de l'envoi. Veuillez réessayer.",
  },
};

// Hybrid placeholders per language — primary country for each locale.
// Open numbering plan (UK, France): show (0) trunk prefix — dialled locally, dropped internationally.
// Closed numbering plan (Oman, Spain): no trunk prefix — same number used locally and internationally.
const PHONE_PLACEHOLDERS: Record<string, string> = {
  EN: "+44 (0)XXXX XXXXXX",    // UK — open plan, trunk prefix shown
  AR: "+968 XXXX XXXX",        // Oman — closed plan, no trunk prefix
  FR: "+33 (0)X XX XX XX XX",  // France — open plan, trunk prefix shown
  ES: "+34 XXX XXX XXX",       // Spain — closed plan, no trunk prefix
};

const STORAGE_KEY = "astgse-contact-draft";

export default function ContactPage() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const [lang, setLang] = useState<LangCode>("EN");
  const [fields, setFields] = useState({ name: "", email: "", phone: "", company: "", message: "" });

  const t = CONTACT_UI[lang];
  const isRtl = lang === "AR";
  const phonePlaceholder = PHONE_PLACEHOLDERS[lang] ?? PHONE_PLACEHOLDERS.EN;

  // Load draft from localStorage on mount (expires after 24 hours)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { fields: savedFields, savedAt } = JSON.parse(saved);
        if (Date.now() - savedAt < 24 * 60 * 60 * 1000) setFields(savedFields);
        else localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }, []);

  // Persist draft to localStorage on change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ fields, savedAt: Date.now() })); } catch {}
  }, [fields]);

  // Clear draft on successful submit
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setFields({ name: "", email: "", phone: "", company: "", message: "" });
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  }, [state.success]);

  const setField = (name: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields(f => ({ ...f, [name]: e.target.value }));

  useEffect(() => {
    const saved = (localStorage.getItem("astgse-lang") ?? "EN") as LangCode;
    setLang(CONTACT_UI[saved] ? saved : "EN");

    const handler = (e: Event) => {
      const code = (e as CustomEvent<string>).detail as LangCode;
      setLang(CONTACT_UI[code] ? code : "EN");
    };
    window.addEventListener("astgse:lang-change", handler);
    return () => window.removeEventListener("astgse:lang-change", handler);
  }, []);

  return (
    <div className="contact-page min-h-screen bg-blue text-white flex flex-col">
      <Navbar />

      <main className="contact-page__main page-px flex flex-col flex-1 max-w-[1440px] mx-auto w-full py-[40px] md:py-[80px]" translate="no">

        {/* Breadcrumb */}
        <nav
          className="contact-breadcrumb flex items-center gap-[12px] mb-[40px] md:mb-[64px]"
          style={{ fontFamily: "var(--font-almaren-nueva)", fontSize: "0.875rem", fontWeight: 21 }}
          aria-label="Breadcrumb"
        >
          <Link href="/" className="contact-breadcrumb__link transition-colors" style={{ color: "rgba(255,255,255,0.40)" }}>Home</Link>
          <span style={{ color: "#00FF7E" }}>/</span>
          <span style={{ color: "#ffffff" }}>Contact</span>
        </nav>

        <div className="contact-page__grid grid grid-cols-1 lg:grid-cols-2 gap-[64px] lg:gap-[120px]">

          {/* Left — heading + info */}
          <div className="contact-page__intro flex flex-col gap-[32px]">
            <h1
              className="contact-page__heading text-[2.75rem] leading-[3rem] md:text-[3.25rem] md:leading-[3.625rem] lg:text-[4.375rem] lg:leading-[5rem]"
              style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}
            >
              <span style={{ display: "block" }}><span style={{ backgroundColor: "#00FF7E", color: "#141127" }}>{t.heading1}</span></span>
              <span style={{ display: "block" }}>{t.heading2}</span>
            </h1>

            <p
              className="contact-page__subtext text-white"
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "0.9375rem",
                textTransform: "uppercase",
                lineHeight: "normal",
                maxWidth: "28rem",
                color: "#ffffff",
              }}
            >
              {t.subtext}
            </p>

            <div className="contact-page__details flex flex-col gap-[16px]" style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem" }}>
              <a href="mailto:enquiries@astgse.com" translate="no" dir="ltr" className="contact-page__email flex items-center gap-[12px] text-white hover:text-[#00FF7E] transition-colors duration-200" style={{ justifyContent: isRtl ? "flex-end" : "flex-start" }}>
                enquiries@astgse.com
              </a>
              <a href="tel:+447544309803" translate="no" dir="ltr" className="contact-page__phone flex items-center gap-[12px] text-white hover:text-[#00FF7E] transition-colors duration-200" style={{ justifyContent: isRtl ? "flex-end" : "flex-start" }}>
                +44 (0)7544 309803
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div className="contact-page__form-wrap" dir="ltr">
            {state.success ? (
              <div className="contact-form__success flex flex-col gap-[16px] py-[40px]">
                <div style={{ width: 48, height: 48, backgroundColor: "#00FF7E", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="16" viewBox="0 0 22 16" fill="none"><path d="M1.5 8L8 14.5L20.5 1.5" stroke="#141127" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21, fontSize: "1.5rem" }}>{t.successHeading}</h2>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.875rem", color: "rgba(255,255,255,0.60)", textTransform: "uppercase" }}>
                  {t.successBody}
                </p>
              </div>
            ) : (
              <form ref={formRef} action={action} className="contact-form flex flex-col gap-[24px]">

                <div className="contact-form__row grid grid-cols-1 sm:grid-cols-2 gap-[24px]">
                  <Field label={t.labelName} name="name" autoComplete="name" placeholder={t.placeholderName} value={fields.name} onChange={setField("name")} error={state.fieldErrors?.name} />
                  <Field label={t.labelEmail} name="email" type="email" autoComplete="email" placeholder={t.placeholderEmail} value={fields.email} onChange={setField("email")} error={state.fieldErrors?.email} />
                </div>

                <div className="contact-form__row grid grid-cols-1 sm:grid-cols-2 gap-[24px]">
                  <Field
                    label={t.labelPhone}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder={phonePlaceholder}
                    maxLength={20}
                    value={fields.phone}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/[^\d+ ]/g, "")
                        .replace(/(?!^)\+/g, "")
                        .slice(0, 20);
                      setFields(f => ({ ...f, phone: val }));
                    }}
                    error={state.fieldErrors?.phone}
                  />
                  <Field label={t.labelCompany} name="company" autoComplete="organization" placeholder={t.placeholderCompany} value={fields.company} onChange={setField("company")} error={state.fieldErrors?.company} />
                </div>

                <div className="contact-form__field flex flex-col gap-[8px]">
                  <label
                    htmlFor="message"
                    className="contact-form__label"
                    style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", textTransform: "uppercase", color: "#ffffff", letterSpacing: "0.05em" }}
                  >
                    {t.labelMessage.replace(" *", "")} <sup style={{ color: "#00FF7E" }}>*</sup>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder={t.placeholderMessage}
                    value={fields.message}
                    onChange={setField("message")}
                    className="contact-form__textarea w-full resize-none text-white placeholder-white/30 outline-none transition-colors duration-200"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: state.fieldErrors?.message ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                      padding: "14px 16px",
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.9375rem",
                    }}
                  />
                  {state.fieldErrors?.message && (
                    <span className="contact-form__error" style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem", color: "#ef4444" }}>
                      {state.fieldErrors.message}
                    </span>
                  )}
                </div>

                {state.error && (
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem", color: "#ef4444", textTransform: "uppercase" }}>
                    {t.errorGeneral}
                  </p>
                )}

                {/* Pass current lang to server so email arrives in English */}
                <input type="hidden" name="lang" value={lang} />
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  options={{ size: "invisible" }}
                />
                {/* Honeypot — bots fill this, humans don't */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />

                <button
                  type="submit"
                  disabled={pending}
                  className="contact-form__submit self-start flex items-center gap-[12px] text-blue font-medium transition-opacity duration-200"
                  style={{
                    backgroundColor: "#00FF7E",
                    borderRadius: 8,
                    padding: "14px 28px",
                    fontFamily: "var(--font-inter)",
                    fontSize: "0.9375rem",
                    border: "none",
                    cursor: pending ? "not-allowed" : "pointer",
                    opacity: pending ? 0.6 : 1,
                  }}
                >
                  {pending ? t.sending : t.send}
                </button>

              </form>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

function Field({
  label, name, type = "text", autoComplete, placeholder, pattern, maxLength, value, onChange, error,
}: {
  label: string; name: string; type?: string; autoComplete?: string; placeholder?: string;
  pattern?: string; maxLength?: number; value?: string; onChange?: React.ChangeEventHandler<HTMLInputElement>; error?: string;
}) {
  return (
    <div className="contact-form__field flex flex-col gap-[8px]">
      <label
        htmlFor={name}
        className="contact-form__label"
        style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", textTransform: "uppercase", color: "#ffffff", letterSpacing: "0.05em" }}
      >
        {label.includes("*") ? <>{label.replace(" *", "")} <sup style={{ color: "#00FF7E" }}>*</sup></> : label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        pattern={pattern}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        className="contact-form__input w-full text-white placeholder-white/30 outline-none transition-colors duration-200"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: error ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8,
          padding: "14px 16px",
          fontFamily: "var(--font-inter)",
          fontSize: "0.9375rem",
        }}
      />
      {error && (
        <span className="contact-form__error" style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem", color: "#ef4444" }}>
          {error}
        </span>
      )}
    </div>
  );
}
