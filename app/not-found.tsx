"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { type LC, isRtl } from "@/app/i18n/config";
import { useLang } from "@/app/hooks/useLang";

const UI: Record<LC, { heading: string; body: string; cta: string }> = {
  EN: { heading: "Page not found.", body: "The page you're looking for doesn't exist or has been moved.", cta: "Back to homepage" },
  AR: { heading: "الصفحة غير موجودة.", body: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.", cta: "العودة إلى الصفحة الرئيسية" },
  ES: { heading: "Página no encontrada.", body: "La página que buscas no existe o ha sido movida.", cta: "Volver a la página principal" },
  FR: { heading: "Page introuvable.", body: "La page que vous recherchez n'existe pas ou a été déplacée.", cta: "Retour à l'accueil" },
};

export default function NotFound() {
  const lang = useLang();
  const t = UI[lang];

  return (
    <div
      dir={isRtl(lang) ? "rtl" : "ltr"}
      className="not-found-page relative h-screen flex flex-col items-center justify-center text-white"
      style={{ backgroundColor: "#141127", fontFamily: "var(--font-inter)" }}
    >
      <p
        className="not-found__code"
        style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.875rem", color: "#00FF7E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24 }}
      >
        404
      </p>
      <h1
        className="not-found__heading text-[2rem] leading-[2.25rem] md:text-[3rem] md:leading-[3.25rem] text-center"
        style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21, maxWidth: "28rem", marginBottom: 16 }}
      >
        {t.heading}
      </h1>
      <p
        className="not-found__body text-center"
        style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", lineHeight: "1.5rem", maxWidth: "22rem", marginBottom: 48 }}
      >
        {t.body}
      </p>
      <Link
        href="/"
        className="not-found__cta inline-flex items-center hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300 ease-out"
        style={{ paddingBlock: 8, paddingInlineStart: 20, paddingInlineEnd: 8, gap: 12, border: "1px solid #00FF7E", borderRadius: 100, fontSize: "0.9375rem" }}
      >
        {t.cta}
        <span className="flex items-center justify-center rounded-full bg-[#00FF7E]" style={{ width: 30, height: 30, transform: isRtl(lang) ? "scaleX(-1)" : undefined }}>
          <ArrowRight size={14} color="#141127" strokeWidth={2.5} />
        </span>
      </Link>
    </div>
  );
}
