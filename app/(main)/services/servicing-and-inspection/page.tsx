"use client";

import { useLang } from "@/app/hooks/useLang";
import { type LC } from "@/app/i18n/config";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";

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
        <Breadcrumbs crumbs={[
          { label: t.breadHome, href: "/" },
          { label: t.breadServices, href: "/services/maintenance-and-diagnostics" },
          { label: t.breadParent, href: "/services/maintenance-and-diagnostics" },
          { label: t.breadCurrent },
        ]} />
      </div>
    </main>
  );
}
