"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useLang } from "@/app/hooks/useLang";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Grip } from "lucide-react";
import Navbar from "@/app/components/navigation/Navbar";
import { submitContact, type ContactFormState } from "@/app/actions/contact";
import { Turnstile } from "@marsidev/react-turnstile";
import { type LC as LangCode, isRtl } from "@/app/i18n/config";

const initial: ContactFormState = { success: false };

const CONTACT_UI: Record<LangCode, {
  heading1Green: string; heading1Rest: string; heading2: string; subtext: string;
  labelName: string; labelEmail: string; labelPhone: string; labelCompany: string; labelMessage: string;
  placeholderName: string; placeholderEmail: string; placeholderCompany: string; placeholderMessage: string;
  send: string; sending: string;
  successHeading: string; successBody: string;
  consentText: string; consentPrivacy: string; consentCookie: string; consentAnd: string;
  breadcrumbHome: string; breadcrumbContact: string;
  errors: Record<string, string>;
}> = {
  EN: {
    heading1Green: "Speak", heading1Rest: " to our", heading2: "team today",
    subtext: "Whether you're looking to source equipment, need a maintenance quote, or want to discuss contract support, our team is ready to help.",
    labelName: "Name *", labelEmail: "Email *", labelPhone: "Phone", labelCompany: "Company", labelMessage: "Message *",
    placeholderName: "First and last", placeholderEmail: "name@example.com", placeholderCompany: "Example Co", placeholderMessage: "How can we help?",
    send: "Submit", sending: "Sending",
    successHeading: "Message sent.", successBody: "We'll be in touch shortly.",
    consentText: "Yes, I give permission to store and process my data. You can find more information in our",
    consentPrivacy: "privacy policy", consentCookie: "cookie policy", consentAnd: "and",
    breadcrumbHome: "Home", breadcrumbContact: "Contact",
    errors: {
      name_required:    "Name is required",
      email_invalid:    "Invalid email address",
      phone_invalid:    "Please enter a valid phone number",
      message_short:    "Message must be at least 10 characters",
      consent_required: "Consent is required to store and process the data in this form.",
      rate_limit:       "Too many submissions. Please try again later.",
      send_failed:      "Failed to send message. Please try again.",
      verify_failed:    "Verification failed. Please try again.",
    },
  },
  AR: {
    heading1Green: "تواصل", heading1Rest: "", heading2: "معنا اليوم.",
    subtext: "سواء كنت تبحث عن معدات محددة، أو تحتاج إلى عرض أسعار للصيانة، أو تريد فقط مناقشة خياراتك — نحن هنا.",
    labelName: "الاسم *", labelEmail: "البريد الإلكتروني *", labelPhone: "الهاتف", labelCompany: "الشركة", labelMessage: "الرسالة *",
    placeholderName: "اسمك", placeholderEmail: "عنوان بريدك الإلكتروني", placeholderCompany: "شركتك", placeholderMessage: "أخبرنا بما تحتاجه...",
    send: "أرسل رسالة", sending: "جارٍ الإرسال",
    successHeading: "تم إرسال رسالتك.", successBody: "سنتواصل معك قريباً.",
    consentText: "نعم، أمنح الإذن بتخزين بياناتي ومعالجتها. يمكنك الاطلاع على مزيد من المعلومات في",
    consentPrivacy: "سياسة الخصوصية", consentCookie: "سياسة ملفات تعريف الارتباط", consentAnd: "و",
    breadcrumbHome: "الرئيسية", breadcrumbContact: "اتصل بنا",
    errors: {
      name_required:    "الاسم مطلوب",
      email_invalid:    "عنوان البريد الإلكتروني غير صالح",
      phone_invalid:    "يرجى إدخال رقم هاتف صحيح",
      message_short:    "يجب أن تحتوي الرسالة على 10 أحرف على الأقل",
      consent_required: "موافقتك مطلوبة لتخزين ومعالجة البيانات في هذا النموذج.",
      rate_limit:       "عدد كبير جداً من المحاولات. يرجى المحاولة مرة أخرى لاحقاً.",
      send_failed:      "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.",
      verify_failed:    "فشل التحقق. يرجى المحاولة مرة أخرى.",
    },
  },
  ES: {
    heading1Green: "Ponte", heading1Rest: " en", heading2: "contacto hoy.",
    subtext: "Si buscas un equipo específico, necesitas un presupuesto de mantenimiento, o simplemente quieres explorar tus opciones — estamos aquí.",
    labelName: "Nombre *", labelEmail: "Correo *", labelPhone: "Teléfono", labelCompany: "Empresa", labelMessage: "Mensaje *",
    placeholderName: "Tu nombre", placeholderEmail: "Tu correo electrónico", placeholderCompany: "Tu empresa", placeholderMessage: "Cuéntanos qué necesitas...",
    send: "Enviar mensaje", sending: "Enviando",
    successHeading: "Mensaje enviado.", successBody: "Nos pondremos en contacto pronto.",
    consentText: "Sí, doy permiso para almacenar y procesar mis datos. Puedes obtener más información en nuestra",
    consentPrivacy: "política de privacidad", consentCookie: "política de cookies", consentAnd: "y",
    breadcrumbHome: "Inicio", breadcrumbContact: "Contacto",
    errors: {
      name_required:    "El nombre es obligatorio",
      email_invalid:    "Dirección de correo electrónico no válida",
      phone_invalid:    "Por favor, introduce un número de teléfono válido",
      message_short:    "El mensaje debe tener al menos 10 caracteres",
      consent_required: "Se requiere tu consentimiento para almacenar y procesar los datos de este formulario.",
      rate_limit:       "Demasiados envíos. Por favor, inténtalo más tarde.",
      send_failed:      "Error al enviar el mensaje. Por favor, inténtalo de nuevo.",
      verify_failed:    "Verificación fallida. Por favor, inténtalo de nuevo.",
    },
  },
  FR: {
    heading1Green: "Entrer", heading1Rest: " en", heading2: "contact aujourd'hui.",
    subtext: "Que vous recherchiez un équipement spécifique, ayez besoin d'un devis de maintenance, ou souhaitiez simplement discuter de vos options — nous sommes là.",
    labelName: "Nom *", labelEmail: "Email *", labelPhone: "Téléphone", labelCompany: "Entreprise", labelMessage: "Message *",
    placeholderName: "Votre nom", placeholderEmail: "Votre adresse email", placeholderCompany: "Votre entreprise", placeholderMessage: "Dites-nous ce dont vous avez besoin...",
    send: "Envoyer le message", sending: "Envoi en cours",
    successHeading: "Message envoyé.", successBody: "Nous vous répondrons sous peu.",
    consentText: "Oui, j'autorise le stockage et le traitement de mes données. Vous pouvez en savoir plus dans notre",
    consentPrivacy: "politique de confidentialité", consentCookie: "politique de cookies", consentAnd: "et",
    breadcrumbHome: "Accueil", breadcrumbContact: "Contact",
    errors: {
      name_required:    "Le nom est requis",
      email_invalid:    "Adresse e-mail invalide",
      phone_invalid:    "Veuillez saisir un numéro de téléphone valide",
      message_short:    "Le message doit contenir au moins 10 caractères",
      consent_required: "Votre consentement est requis pour stocker et traiter les données de ce formulaire.",
      rate_limit:       "Trop de soumissions. Veuillez réessayer plus tard.",
      send_failed:      "Échec de l'envoi. Veuillez réessayer.",
      verify_failed:    "Vérification échouée. Veuillez réessayer.",
    },
  },
};

const PHONE_PLACEHOLDERS: Record<string, string> = {
  EN: "Phone number",
  AR: "رقم الهاتف",
  FR: "Numéro de téléphone",
  ES: "Número de teléfono",
};

const STORAGE_KEY = "astgse-contact-draft";

export default function ContactPage() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const lang = useLang();
  const [fields, setFields] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [timezone, setTimezone] = useState("");
  const [consent, setConsent] = useState(false);
  const [messageFocused, setMessageFocused] = useState(false);
  const [messageHeight, setMessageHeight] = useState<number | null>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const t = CONTACT_UI[lang];
  const rtl = isRtl(lang);
  const phonePlaceholder = PHONE_PLACEHOLDERS[lang] ?? PHONE_PLACEHOLDERS.EN;

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

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ fields, savedAt: Date.now() })); } catch {}
  }, [fields]);

  useEffect(() => {
    if (state.success) {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      router.push("/contact/success");
    }
  }, [state.success]);

  const setField = (name: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields(f => ({ ...f, [name]: e.target.value }));
    setClientErrors(errs => { const next = { ...errs }; delete next[name]; return next; });
  };

  function startMessageResize(e: React.MouseEvent) {
    e.preventDefault();
    const startY = e.clientY;
    const startH = messageRef.current?.offsetHeight ?? 144;
    const onMove = (ev: MouseEvent) => setMessageHeight(Math.max(100, startH + ev.clientY - startY));
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return (
    <div className="contact-page min-h-screen bg-blue text-white flex flex-col">
      <Navbar />

      <main className="contact-page__main page-px flex flex-col flex-1 max-w-[1440px] mx-auto w-full pb-[40px] md:pb-[80px]" translate="no">

        {/* Breadcrumb */}
        <nav
          className="contact-breadcrumb flex items-center gap-[12px] pt-[10px] md:pt-4 mb-[30px] md:mb-[64px]"
          style={{ fontFamily: "var(--font-almaren-nueva)", fontSize: "0.875rem", fontWeight: 21 }}
          aria-label="Breadcrumb"
        >
          <Link href="/" className="contact-breadcrumb__link transition-colors" style={{ color: "rgba(255,255,255,0.40)" }}>{t.breadcrumbHome}</Link>
          <span style={{ color: "#00FF7E" }}>/</span>
          <span style={{ color: "#ffffff" }}>{t.breadcrumbContact}</span>
        </nav>

        <div className="contact-page__grid grid grid-cols-1 lg:grid-cols-2 gap-[40px] lg:gap-[120px]" dir={rtl ? "rtl" : "ltr"}>

          {/* Left — heading + info */}
          <div className="contact-page__intro flex flex-col gap-[20px] md:gap-[32px]">
            <h1
              className="contact-page__heading text-[2rem] leading-[2.25rem] md:text-[2.75rem] md:leading-[3rem] lg:text-[3.375rem] lg:leading-[3.625rem]"
              style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}
            >
              <span style={{ display: "block" }}><span style={{ color: "#00FF7E" }}>{t.heading1Green}</span>{t.heading1Rest}</span>
              <span style={{ display: "block" }}>{t.heading2}</span>
            </h1>

            <p
              className="contact-page__subtext text-white"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "1rem",
                lineHeight: "1.5rem",
                maxWidth: "28rem",
                color: "#ffffff",
              }}
            >
              {t.subtext}
            </p>

            <div className="contact-page__details flex flex-col gap-[16px] text-[1.075rem] lg:text-[1.5rem] leading-[1.375rem] lg:leading-[1.75rem]" style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}>
              <a href="mailto:enquiries@astgse.com" translate="no" dir="ltr" className="contact-page__email flex items-center gap-[12px] underline decoration-[0.5px] underline-offset-4 text-white hover:text-[#00FF7E] transition-colors duration-200" style={{ justifyContent: rtl ? "flex-end" : "flex-start" }}>
                enquiries@astgse.com
              </a>
              <a href="tel:+447544309803" translate="no" dir="ltr" className="contact-page__phone flex items-center gap-[12px] underline decoration-[0.5px] underline-offset-4 text-white hover:text-[#00FF7E] transition-colors duration-200" style={{ justifyContent: rtl ? "flex-end" : "flex-start" }}>
                +44 (0)7544 309803
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div className="contact-page__form-wrap">
            <form ref={formRef} action={action} autoComplete="on" className="contact-form flex flex-col gap-[24px]"
              onSubmit={(e) => {
                const errs: Record<string, string> = {};
                if (!fields.name.trim())    errs.name    = t.errors.name_required;
                if (!fields.email.trim())   errs.email   = t.errors.email_invalid;
                if (!fields.message.trim() || fields.message.trim().length < 10) errs.message = t.errors.message_short;
                if (!consent)               errs.consent = t.errors.consent_required;
                if (Object.keys(errs).length) { e.preventDefault(); setClientErrors(errs); }
                else setClientErrors({});
              }}
            >

                <div className="contact-form__row grid grid-cols-1 sm:grid-cols-2 gap-[24px]">
                  <Field label={t.labelName} name="name" autoComplete="name" placeholder={t.placeholderName} value={fields.name} onChange={setField("name")} onClearError={() => setClientErrors(e => { const n = { ...e }; delete n.name; return n; })} error={clientErrors.name ?? state.fieldErrors?.name} errors={t.errors} />
                  <Field label={t.labelEmail} name="email" type="email" autoComplete="email" placeholder={t.placeholderEmail} value={fields.email} onChange={setField("email")} onClearError={() => setClientErrors(e => { const n = { ...e }; delete n.email; return n; })} error={clientErrors.email ?? state.fieldErrors?.email} inputDir="ltr" errors={t.errors} />
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
                      setClientErrors(errs => { const next = { ...errs }; delete next.phone; return next; });
                    }}
                    error={clientErrors.phone ?? state.fieldErrors?.phone}
                    onClearError={() => setClientErrors(e => { const n = { ...e }; delete n.phone; return n; })}
                    inputDir="ltr"
                    errors={t.errors}
                  />
                  <Field label={t.labelCompany} name="company" autoComplete="organization" placeholder={t.placeholderCompany} value={fields.company} onChange={setField("company")} error={state.fieldErrors?.company} errors={t.errors} />
                </div>

                <div className="contact-form__field flex flex-col gap-[8px]">
                  <label
                    htmlFor="message"
                    className="contact-form__label"
                    style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#ffffff" }}
                  >
                    {t.labelMessage.replace(" *", "")} <sup style={{ color: "#00FF7E" }}>*</sup>
                  </label>
                  <div style={{ display: "grid" }}>
                    <textarea
                      ref={messageRef}
                      id="message"
                      name="message"
                      placeholder={t.placeholderMessage}
                      value={fields.message}
                      onChange={setField("message")}
                      onFocus={() => { setMessageFocused(true); setClientErrors(e => { const n = { ...e }; delete n.message; return n; }); }}
                      onBlur={() => setMessageFocused(false)}
                      className="contact-form__textarea w-full resize-none text-white placeholder-white/30 transition-colors duration-200"
                      style={{
                        gridArea: "1/1",
                        background: "rgba(255,255,255,0.05)",
                        border: (clientErrors.message ?? state.fieldErrors?.message) ? "1px solid #ff4d4d" : messageFocused ? "1px solid #00FF7E" : "1px solid transparent",
                        borderRadius: 8,
                        padding: "14px 16px 28px",
                        fontFamily: "var(--font-inter)",
                        fontSize: "0.9375rem",
                        outline: "none",
                        height: messageHeight ? `${messageHeight}px` : "120px",
                      }}
                    />
                    <span
                      className="cursor-ns-resize opacity-30 hover:opacity-60 transition-opacity select-none"
                      style={{ gridArea: "1/1", alignSelf: "end", justifySelf: "end", margin: 7, color: "white", touchAction: "none" }}
                      onMouseDown={startMessageResize}
                    >
                      <Grip size={14} />
                    </span>
                  </div>
                  {(clientErrors.message ?? state.fieldErrors?.message) && (
                    <span className="contact-form__error" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#ff4d4d" }}>
                      {clientErrors.message ?? t.errors[state.fieldErrors!.message!] ?? state.fieldErrors?.message}
                    </span>
                  )}
                </div>

                {state.error && (
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#ff4d4d" }}>
                    {t.errors[state.error] ?? state.error}
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
                  <label className="flex items-start gap-[12px] cursor-pointer" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem", color: "#ffffff", lineHeight: 1.5 }}>
                    <input type="checkbox" name="consent" checked={consent} onChange={e => { setConsent(e.target.checked); setClientErrors(errs => { const next = { ...errs }; delete next.consent; return next; }); }} className="sr-only" />
                    <span
                      className="mt-[2px] shrink-0 flex items-center justify-center transition-colors duration-200"
                      style={{ width: 18, height: 18, border: `1px solid ${consent ? "#00FF7E" : "transparent"}`, borderRadius: 4, backgroundColor: consent ? "#00FF7E" : "rgba(255,255,255,0.05)" }}
                    >
                      {consent && <Check size={12} color="#141127" strokeWidth={3} />}
                    </span>
                    <span>
                      {t.consentText}{" "}
                      <a href="/privacy-policy" className="text-white underline hover:text-[#00FF7E] transition-colors duration-200">{t.consentPrivacy}</a>{" "}
                      {t.consentAnd}{" "}
                      <a href="/cookie-policy" className="text-white underline hover:text-[#00FF7E] transition-colors duration-200">{t.consentCookie}</a>.
                    </span>
                  </label>
                  {(clientErrors.consent ?? state.fieldErrors?.consent) && (
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#ff4d4d", paddingLeft: 30 }}>
                      {clientErrors.consent ?? t.errors[state.fieldErrors!.consent!] ?? state.fieldErrors?.consent}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="contact-form__submit inline-flex items-center text-white hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300 ease-out mt-[16px]"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "0.9375rem",
                    paddingBlock: 8,
                    paddingInlineStart: 20,
                    paddingInlineEnd: 8,
                    gap: 12,
                    border: "1px solid #00FF7E",
                    borderRadius: 100,
                    alignSelf: "start",
                    cursor: pending ? "not-allowed" : "pointer",
                  }}
                >
                  {pending ? t.sending : t.send}
                  <span className="flex items-center justify-center rounded-full bg-[#00FF7E]" style={{ width: 30, height: 30 }}>
                    <ArrowRight size={14} color="#141127" strokeWidth={2.5} style={{ transform: rtl ? "scaleX(-1)" : "none" }} />
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
  label, name, type = "text", autoComplete, placeholder, pattern, maxLength, value, onChange, onClearError, error, inputDir, errors,
}: {
  label: string; name: string; type?: string; autoComplete?: string; placeholder?: string;
  pattern?: string; maxLength?: number; value?: string; onChange?: React.ChangeEventHandler<HTMLInputElement>; onClearError?: () => void; error?: string; inputDir?: "ltr" | "rtl"; errors?: Record<string, string>;
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
        onInput={onChange as React.FormEventHandler<HTMLInputElement>}
        dir={inputDir}
        onFocus={() => { setFocused(true); onClearError?.(); }}
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
          {errors?.[error] ?? error}
        </span>
      )}
    </div>
  );
}
