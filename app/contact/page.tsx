"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
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
    heading1: "Speak to", heading2: "our team.",
    subtext: "Whether you're looking to source equipment, need a maintenance quote, or want to discuss contract support, our team is ready to help.",
    labelName: "Name *", labelEmail: "Email *", labelPhone: "Phone", labelCompany: "Company", labelMessage: "Message *",
    placeholderName: "First and last", placeholderEmail: "name@example.com", placeholderCompany: "Example Co", placeholderMessage: "How can we help?",
    send: "Submit", sending: "Sending",
    successHeading: "Message sent.", successBody: "We'll be in touch shortly.",
    errorGeneral: "Failed to send message. Please try again.",
  },
  AR: {
    heading1: "تواصل", heading2: "معنا.",
    subtext: "سواء كنت تبحث عن معدات محددة، أو تحتاج إلى عرض أسعار للصيانة، أو تريد فقط مناقشة خياراتك — نحن هنا.",
    labelName: "الاسم *", labelEmail: "البريد الإلكتروني *", labelPhone: "الهاتف", labelCompany: "الشركة", labelMessage: "الرسالة *",
    placeholderName: "اسمك", placeholderEmail: "عنوان بريدك الإلكتروني", placeholderCompany: "شركتك", placeholderMessage: "أخبرنا بما تحتاجه...",
    send: "أرسل رسالة", sending: "جارٍ الإرسال",
    successHeading: "تم إرسال رسالتك.", successBody: "سنتواصل معك قريباً.",
    errorGeneral: "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.",
  },
  ES: {
    heading1: "Ponte en", heading2: "contacto.",
    subtext: "Si buscas un equipo específico, necesitas un presupuesto de mantenimiento, o simplemente quieres explorar tus opciones — estamos aquí.",
    labelName: "Nombre *", labelEmail: "Correo *", labelPhone: "Teléfono", labelCompany: "Empresa", labelMessage: "Mensaje *",
    placeholderName: "Tu nombre", placeholderEmail: "Tu correo electrónico", placeholderCompany: "Tu empresa", placeholderMessage: "Cuéntanos qué necesitas...",
    send: "Enviar mensaje", sending: "Enviando",
    successHeading: "Mensaje enviado.", successBody: "Nos pondremos en contacto pronto.",
    errorGeneral: "Error al enviar el mensaje. Por favor, inténtalo de nuevo.",
  },
  FR: {
    heading1: "Entrer en", heading2: "contact.",
    subtext: "Que vous recherchiez un équipement spécifique, ayez besoin d'un devis de maintenance, ou souhaitiez simplement discuter de vos options — nous sommes là.",
    labelName: "Nom *", labelEmail: "Email *", labelPhone: "Téléphone", labelCompany: "Entreprise", labelMessage: "Message *",
    placeholderName: "Votre nom", placeholderEmail: "Votre adresse email", placeholderCompany: "Votre entreprise", placeholderMessage: "Dites-nous ce dont vous avez besoin...",
    send: "Envoyer le message", sending: "Envoi en cours",
    successHeading: "Message envoyé.", successBody: "Nous vous répondrons sous peu.",
    errorGeneral: "Échec de l'envoi. Veuillez réessayer.",
  },
};

// Hybrid placeholders per language — primary country for each locale.
// Open numbering plan (UK, France): show (0) trunk prefix — dialled locally, dropped internationally.
// Closed numbering plan (Oman, Spain): no trunk prefix — same number used locally and internationally.
const PHONE_PLACEHOLDERS: Record<string, string> = {
  EN: "00000 000 000",
  AR: "0000 0000",
  FR: "00 00 00 00 00",
  ES: "000 000 000",
};

const STORAGE_KEY = "astgse-contact-draft";

export default function ContactPage() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [lang, setLang] = useState<LangCode>("EN");
  const [fields, setFields] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [timezone, setTimezone] = useState("");
  const [consent, setConsent] = useState(false);
  const [messageFocused, setMessageFocused] = useState(false);

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

  // On successful submit: clear draft and redirect to success page
  useEffect(() => {
    if (state.success) {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      router.push("/contact/success");
    }
  }, [state.success]);

  const setField = (name: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields(f => ({ ...f, [name]: e.target.value }));

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
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

      <main className="contact-page__main page-px flex flex-col flex-1 max-w-[1440px] mx-auto w-full pb-[40px] md:pb-[80px]" translate="no">

        {/* Breadcrumb */}
        <nav
          className="contact-breadcrumb flex items-center gap-[12px] pt-[10px] md:pt-4 mb-[40px] md:mb-[64px]"
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
              className="contact-page__heading text-[2rem] leading-[2.25rem] md:text-[2.75rem] md:leading-[3rem] lg:text-[3.375rem] lg:leading-[3.625rem]"
              style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}
            >
              <span style={{ display: "block" }}><span style={{ color: "#00FF7E" }}>Speak</span> to</span>
              <span style={{ display: "block" }}>{t.heading2}</span>
            </h1>

            <p
              className="contact-page__subtext text-white"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "1.125rem",
                lineHeight: "1.875rem",
                maxWidth: "28rem",
                color: "#ffffff",
              }}
            >
              {t.subtext}
            </p>

            <div className="contact-page__details flex flex-col gap-[16px]" style={{ fontFamily: "var(--font-inter)", fontSize: "1.125rem", lineHeight: "1.875rem" }}>
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
                      const val = e.target.value.replace(/[^\d+ ]/g, "").replace(/(?!^)\+/g, "").slice(0, 20);
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
                    style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#ffffff" }}
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
                    onFocus={() => setMessageFocused(true)}
                    onBlur={() => setMessageFocused(false)}
                    className="contact-form__textarea w-full resize-none text-white placeholder-white/30 transition-colors duration-200"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: state.fieldErrors?.message ? "1px solid #ff4d4d" : messageFocused ? "1px solid #00FF7E" : "1px solid transparent",
                      borderRadius: 8,
                      padding: "14px 16px",
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.9375rem",
                      outline: "none",
                    }}
                  />
                  {state.fieldErrors?.message && (
                    <span className="contact-form__error" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#ff4d4d" }}>
                      {state.fieldErrors.message}
                    </span>
                  )}
                </div>

                {state.error && (
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#ff4d4d", textTransform: "uppercase" }}>
                    {t.errorGeneral}
                  </p>
                )}

                {/* Hidden fields — grouped so they don't create flex gaps */}
                <div style={{ display: "none" }} aria-hidden="true">
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="timezone" value={timezone} />
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </div>
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  options={{ size: "invisible" }}
                  style={{ display: "none" }}
                />

                {/* Consent checkbox */}
                <div className="flex flex-col gap-[8px]">
                  <label className="flex items-start gap-[12px] cursor-pointer" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#ffffff", lineHeight: 1.5 }}>
                    <input type="checkbox" name="consent" checked={consent} onChange={e => setConsent(e.target.checked)} className="sr-only" />
                    <span
                      className="mt-[2px] shrink-0 flex items-center justify-center transition-colors duration-200"
                      style={{ width: 18, height: 18, border: `1px solid ${consent ? "#00FF7E" : "transparent"}`, borderRadius: 4, backgroundColor: consent ? "#00FF7E" : "rgba(255,255,255,0.05)" }}
                    >
                      {consent && <Check size={12} color="#141127" strokeWidth={3} />}
                    </span>
                    <span>
                      Yes, I give permission to store and process my data. You can find more information in our{" "}
                      <a href="/privacy-policy" className="text-white underline hover:text-[#00FF7E] transition-colors duration-200">privacy policy</a>{" "}
                      and{" "}
                      <a href="/cookie-policy" className="text-white underline hover:text-[#00FF7E] transition-colors duration-200">cookie policy</a>.
                    </span>
                  </label>
                  {state.fieldErrors?.consent && (
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#ff4d4d", paddingLeft: 30 }}>{state.fieldErrors.consent}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="contact-form__submit self-start inline-flex items-center text-white hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300 ease-out mt-[16px]"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "0.9375rem",
                    paddingBlock: 8,
                    paddingInlineStart: 20,
                    paddingInlineEnd: 8,
                    gap: 12,
                    border: "1px solid #00FF7E",
                    borderRadius: 100,
                    cursor: pending ? "not-allowed" : "pointer",
                  }}
                >
                  {pending ? t.sending : t.send}
                  <span className="flex items-center justify-center rounded-full bg-[#00FF7E]" style={{ width: 30, height: 30 }}>
                    <ArrowRight size={14} color="#141127" strokeWidth={2.5} />
                  </span>
                </button>

              </form>
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
  const [focused, setFocused] = useState(false);
  return (
    <div className="contact-form__field flex flex-col gap-[8px]">
      <label
        htmlFor={name}
        className="contact-form__label"
        style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#ffffff" }}
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="contact-form__input w-full text-white placeholder-white/30 transition-colors duration-200"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: error ? "1px solid #ff4d4d" : focused ? "1px solid #00FF7E" : "1px solid transparent",
          borderRadius: 8,
          padding: "14px 16px",
          fontFamily: "var(--font-inter)",
          fontSize: "0.9375rem",
          outline: "none",
        }}
      />
      {error && (
        <span className="contact-form__error" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#ff4d4d" }}>
          {error}
        </span>
      )}
    </div>
  );
}
