"use client";

import Link from "next/link";
import { useLang } from "@/app/hooks/useLang";
import { type LC } from "@/app/i18n/config";

const UI: Record<LC, { breadHome: string; breadServices: string; breadParent: string; breadCurrent: string }> = {
  EN: { breadHome: "Home", breadServices: "Services", breadParent: "Maintenance and diagnostics", breadCurrent: "Servicing and inspection" },
  AR: { breadHome: "الرئيسية", breadServices: "الخدمات", breadParent: "الصيانة والتشخيص", breadCurrent: "الخدمة والتفتيش" },
  ES: { breadHome: "Inicio", breadServices: "Servicios", breadParent: "Mantenimiento y diagnósticos", breadCurrent: "Servicio e inspección" },
  FR: { breadHome: "Accueil", breadServices: "Services", breadParent: "Maintenance et diagnostics", breadCurrent: "Service et inspection" },
};

export default function ServicingAndInspection() {
  const lang = useLang();
  const t = UI[lang];

  return (
    <main className="min-h-screen bg-blue text-white flex flex-col pt-[80px]">
      <div className="page-px max-w-[1440px] mx-auto w-full">
        <nav
          className="flex items-center gap-[12px] pt-[10px] md:pt-4 pb-[30px] md:pb-[40px] lg:pb-[80px]"
          style={{ fontFamily: "var(--font-almaren-nueva)", fontSize: "0.875rem", fontWeight: 21 }}
          aria-label="Breadcrumb"
          translate="no"
        >
          <Link href="/" style={{ color: "rgba(255,255,255,0.40)" }}>{t.breadHome}</Link>
          <span style={{ color: "#00FF7E" }}>/</span>
          <Link href="/services" style={{ color: "rgba(255,255,255,0.40)" }}>{t.breadServices}</Link>
          <span style={{ color: "#00FF7E" }}>/</span>
          <Link href="/services/maintenance-and-diagnostics" style={{ color: "rgba(255,255,255,0.40)" }}>{t.breadParent}</Link>
          <span style={{ color: "#00FF7E" }}>/</span>
          <span style={{ color: "#ffffff" }}>{t.breadCurrent}</span>
        </nav>
      </div>
    </main>
  );
}
