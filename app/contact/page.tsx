"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/app/components/navigation/Navbar";
import { submitContact, type ContactFormState } from "@/app/actions/contact";

const initial: ContactFormState = { success: false };

export default function ContactPage() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div className="contact-page min-h-screen bg-blue text-white flex flex-col">
      <Navbar />

      <main className="contact-page__main page-px flex flex-col flex-1 max-w-[1440px] mx-auto w-full py-[40px] md:py-[80px]">

        {/* Breadcrumb */}
        <nav
          className="contact-breadcrumb flex items-center gap-[12px] mb-[40px] md:mb-[64px]"
          style={{ fontFamily: "var(--font-almaren-nueva)", fontSize: "0.875rem", fontWeight: 21 }}
          aria-label="Breadcrumb"
        >
          <Link href="/" className="contact-breadcrumb__link transition-colors" style={{ color: "rgba(255,255,255,0.40)" }}>Home</Link>
          <span style={{ color: "#00FF7E" }}>/</span>
          <span style={{ color: "rgba(255,255,255,0.40)" }}>Contact</span>
        </nav>

        <div className="contact-page__grid grid grid-cols-1 lg:grid-cols-2 gap-[64px] lg:gap-[120px]">

          {/* Left — heading + info */}
          <div className="contact-page__intro flex flex-col gap-[32px]">
            <h1
              className="contact-page__heading text-[2.75rem] leading-[3rem] md:text-[3.25rem] md:leading-[3.625rem] lg:text-[4.375rem] lg:leading-[5rem]"
              style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}
            >
              <span style={{ backgroundColor: "#00FF7E", color: "#141127" }}>Get in</span>{"\n"}
              <span>touch.</span>
            </h1>

            <p
              className="contact-page__subtext text-white"
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "0.9375rem",
                textTransform: "uppercase",
                lineHeight: "normal",
                maxWidth: "28rem",
                color: "rgba(255,255,255,0.70)",
              }}
            >
              Whether you&apos;re looking for a specific piece of equipment, need a maintenance quote, or just want to talk through your options — we&apos;re here.
            </p>

            <div className="contact-page__details flex flex-col gap-[16px]" style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem" }}>
              <a href="mailto:enquiries@astgse.com" className="contact-page__email flex items-center gap-[12px] text-white hover:text-[#00FF7E] transition-colors duration-200">
                enquiries@astgse.com
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div className="contact-page__form-wrap">
            {state.success ? (
              <div className="contact-form__success flex flex-col gap-[16px] py-[40px]">
                <div style={{ width: 48, height: 48, backgroundColor: "#00FF7E", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="16" viewBox="0 0 22 16" fill="none"><path d="M1.5 8L8 14.5L20.5 1.5" stroke="#141127" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21, fontSize: "1.5rem" }}>Message sent.</h2>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.875rem", color: "rgba(255,255,255,0.60)", textTransform: "uppercase" }}>
                  We&apos;ll be in touch shortly.
                </p>
              </div>
            ) : (
              <form ref={formRef} action={action} className="contact-form flex flex-col gap-[24px]">

                <div className="contact-form__row grid grid-cols-1 sm:grid-cols-2 gap-[24px]">
                  <Field label="Name *" name="name" placeholder="Your name" error={state.fieldErrors?.name} />
                  <Field label="Email *" name="email" type="email" placeholder="your@email.com" error={state.fieldErrors?.email} />
                </div>

                <div className="contact-form__row grid grid-cols-1 sm:grid-cols-2 gap-[24px]">
                  <Field label="Phone" name="phone" type="tel" placeholder="+1 234 567 8900" error={state.fieldErrors?.phone} />
                  <Field label="Company" name="company" placeholder="Your company" error={state.fieldErrors?.company} />
                </div>

                <div className="contact-form__field flex flex-col gap-[8px]">
                  <label
                    htmlFor="message"
                    className="contact-form__label"
                    style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", textTransform: "uppercase", color: "rgba(255,255,255,0.50)", letterSpacing: "0.05em" }}
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Tell us what you need..."
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
                    <span className="contact-form__error" style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", color: "#ef4444" }}>
                      {state.fieldErrors.message}
                    </span>
                  )}
                </div>

                {state.error && (
                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", color: "#ef4444", textTransform: "uppercase" }}>
                    {state.error}
                  </p>
                )}

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
                  {pending ? "Sending…" : "Send message"}
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
  label, name, type = "text", placeholder, error,
}: {
  label: string; name: string; type?: string; placeholder?: string; error?: string;
}) {
  return (
    <div className="contact-form__field flex flex-col gap-[8px]">
      <label
        htmlFor={name}
        className="contact-form__label"
        style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", textTransform: "uppercase", color: "rgba(255,255,255,0.50)", letterSpacing: "0.05em" }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
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
        <span className="contact-form__error" style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", color: "#ef4444" }}>
          {error}
        </span>
      )}
    </div>
  );
}
