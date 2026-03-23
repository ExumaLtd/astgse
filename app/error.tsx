"use client";

import { type LC, isRtl } from "@/app/i18n/config";
import { useLang } from "@/app/hooks/useLang";

const UI: Record<LC, { label: string; heading: string; cta: string }> = {
  EN: { label: "Something went wrong", heading: "Unable to load this page", cta: "Try again" },
  AR: { label: "حدث خطأ ما", heading: "تعذر تحميل هذه الصفحة", cta: "حاول مجدداً" },
  ES: { label: "Algo salió mal", heading: "No se puede cargar esta página", cta: "Intentar de nuevo" },
  FR: { label: "Quelque chose a mal tourné", heading: "Impossible de charger cette page", cta: "Réessayer" },
};

export default function GlobalError({ reset }: { reset: () => void }) {
  const lang = useLang();
  const t = UI[lang];

  return (
    <div
      dir={isRtl(lang) ? "rtl" : "ltr"}
      className="relative h-screen bg-blue flex flex-col items-center justify-center text-white"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <p className="text-[#00FF7E] text-sm uppercase tracking-widest mb-4">{t.label}</p>
      <h1 className="text-3xl mb-8" style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}>
        {t.heading}
      </h1>
      <button
        onClick={reset}
        className="inline-flex items-center rounded-full text-white hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300"
        style={{ paddingBlock: 8, paddingInlineStart: 20, paddingInlineEnd: 20, border: "1px solid #00FF7E", borderRadius: 100 }}
      >
        {t.cta}
      </button>
    </div>
  );
}
