"use client";

import Link from "next/link";
import Navbar from "@/app/components/navigation/Navbar";
import { type NavData } from "@/sanity/lib/getNavigation";
import { type LC, isRtl } from "@/app/i18n/config";
import { useLang } from "@/app/hooks/useLang";

const UI: Record<LC, {
  breadHome: string;
  breadContact: string;
  breadCurrent: string;
  label: string;
  headingBefore: string;
  headingGreen: string;
  body: string;
}> = {
  EN: {
    breadHome: "Home",
    breadContact: "Contact",
    breadCurrent: "Form submitted successfully",
    label: "Thank you for contacting us",
    headingBefore: "Your message has been received and",
    headingGreen: "a member of our team will respond within 1 working day.",
    body: "For urgent enquiries, please call us directly on",
  },
  AR: {
    breadHome: "الرئيسية",
    breadContact: "اتصل بنا",
    breadCurrent: "تم إرسال النموذج بنجاح",
    label: "شكراً لتواصلك معنا",
    headingBefore: "تم استلام رسالتك و",
    headingGreen: "سيرد أحد أعضاء فريقنا خلال يوم عمل واحد.",
    body: "للاستفسارات العاجلة، يرجى الاتصال بنا مباشرة على",
  },
  ES: {
    breadHome: "Inicio",
    breadContact: "Contacto",
    breadCurrent: "Formulario enviado con éxito",
    label: "Gracias por contactarnos",
    headingBefore: "Tu mensaje ha sido recibido y",
    headingGreen: "un miembro de nuestro equipo responderá en 1 día hábil.",
    body: "Para consultas urgentes, llámenos directamente al",
  },
  FR: {
    breadHome: "Accueil",
    breadContact: "Contact",
    breadCurrent: "Formulaire soumis avec succès",
    label: "Merci de nous avoir contactés",
    headingBefore: "Votre message a bien été reçu et",
    headingGreen: "un membre de notre équipe vous répondra dans 1 jour ouvré.",
    body: "Pour les demandes urgentes, appelez-nous directement au",
  },
};

export default function ContactSuccess({ navData }: { navData?: NavData }) {
  const lang = useLang();
  const t = UI[lang];

  return (
    <div className="min-h-screen bg-blue text-white flex flex-col">
      <Navbar navData={navData} />
      <main
        dir={isRtl(lang) ? "rtl" : "ltr"}
        translate="no"
        className="page-px flex flex-col flex-1 max-w-[1440px] mx-auto w-full pb-[40px] md:pb-[80px]"
      >

        <nav
          className="flex items-center gap-[12px] pt-[10px] md:pt-4 mb-[40px] md:mb-[64px]"
          style={{ fontFamily: "var(--font-almaren-nueva)", fontSize: "0.875rem", fontWeight: 21 }}
          aria-label="Breadcrumb"
        >
          <Link href="/" style={{ color: "rgba(255,255,255,0.40)" }}>{t.breadHome}</Link>
          <span style={{ color: "#00FF7E" }}>/</span>
          <Link href="/contact" style={{ color: "rgba(255,255,255,0.40)" }}>{t.breadContact}</Link>
          <span style={{ color: "#00FF7E" }}>/</span>
          <span style={{ color: "#ffffff" }}>{t.breadCurrent}</span>
        </nav>

        <div className="flex flex-col gap-[32px] max-w-[720px]">
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", color: "#ffffff", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#00FF7E" }}>/</span> {t.label}
          </p>
          <h1 style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21, fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.1 }}>
            {t.headingBefore}{" "}
            <span style={{ color: "#00FF7E" }}>{t.headingGreen}</span>
          </h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", color: "#ffffff", lineHeight: 1.6 }}>
            {t.body}{" "}
            <a href="tel:+447544309803" translate="no" dir="ltr" className="text-white hover:text-[#00FF7E] transition-colors duration-200">+44 (0)7544 309803</a>.
          </p>
        </div>

      </main>
    </div>
  );
}
