"use client";

import Link from "next/link";
import { type LC, isRtl } from "@/app/i18n/config";
import { useLang } from "@/app/hooks/useLang";

const UI: Record<LC, { breadHome: string; breadLegal: string; breadCurrent: string; heading: string; body: string }> = {
  EN: {
    breadHome: "Home",
    breadLegal: "Legal",
    breadCurrent: "Cookie policy",
    heading: "Cookie policy",
    body: "This cookie policy will be updated before launch. If you have any questions in the meantime, please contact us at",
  },
  AR: {
    breadHome: "الرئيسية",
    breadLegal: "قانوني",
    breadCurrent: "سياسة ملفات تعريف الارتباط",
    heading: "سياسة ملفات تعريف الارتباط",
    body: "ستتم تحديث سياسة ملفات تعريف الارتباط هذه قبل الإطلاق. إذا كانت لديك أي أسئلة في الوقت الحالي، يرجى التواصل معنا على",
  },
  ES: {
    breadHome: "Inicio",
    breadLegal: "Legal",
    breadCurrent: "Política de cookies",
    heading: "Política de cookies",
    body: "Esta política de cookies se actualizará antes del lanzamiento. Si tiene alguna pregunta mientras tanto, póngase en contacto con nosotros en",
  },
  FR: {
    breadHome: "Accueil",
    breadLegal: "Légal",
    breadCurrent: "Politique de cookies",
    heading: "Politique de cookies",
    body: "Cette politique de cookies sera mise à jour avant le lancement. Si vous avez des questions entre-temps, veuillez nous contacter à",
  },
};

export default function CookiePolicy() {
  const lang = useLang();
  const t = UI[lang];

  return (
    <div className="min-h-screen bg-blue text-white flex flex-col">
      
      <main
        dir={isRtl(lang) ? "rtl" : "ltr"}
        translate="no"
        className="page-px flex flex-col flex-1 max-w-[1440px] mx-auto w-full pb-[80px]"
      >

        <nav
          className="flex items-center gap-[12px] pt-[10px] md:pt-4 mb-[40px] md:mb-[64px]"
          style={{ fontFamily: "var(--font-almaren-nueva)", fontSize: "0.875rem", fontWeight: 21 }}
          aria-label="Breadcrumb"
        >
          <Link href="/" style={{ color: "rgba(255,255,255,0.40)" }}>{t.breadHome}</Link>
          <span style={{ color: "#00FF7E" }}>/</span>
          <span style={{ color: "rgba(255,255,255,0.40)" }}>{t.breadLegal}</span>
          <span style={{ color: "#00FF7E" }}>/</span>
          <span style={{ color: "#ffffff" }}>{t.breadCurrent}</span>
        </nav>

        <div className="flex flex-col gap-[32px] max-w-[720px]">
          <h1
            className="text-[2rem] leading-[2.25rem] md:text-[2.75rem] md:leading-[3rem] lg:text-[3.375rem] lg:leading-[3.625rem]"
            style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}
          >
            {t.heading}
          </h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", lineHeight: "1.5rem", color: "#ffffff" }}>
            {t.body}{" "}
            <a href="mailto:enquiries@astgse.com" translate="no" className="text-white underline hover:text-[#00FF7E] transition-colors duration-200">
              enquiries@astgse.com
            </a>.
          </p>
        </div>

      </main>
    </div>
  );
}
