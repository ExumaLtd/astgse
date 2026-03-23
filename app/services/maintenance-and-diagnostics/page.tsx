import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import MaintenancePageClient from "./_client";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://astgse.com";

export const metadata = {
  title: { absolute: "ASTGSE | Maintenance and diagnostics" },
  description: "AST's diagnostic capability spans multiple manufacturers and equipment types. We diagnose what others can't — then we fix it.",
  alternates: { canonical: `${BASE_URL}/services/maintenance-and-diagnostics` },
};

export const revalidate = 60;

async function getPage() {
  try {
    return await client.fetch(`*[_type == "servicePage" && slug.current == "maintenance-and-diagnostics"][0]`);
  } catch {
    return null;
  }
}

export default async function MaintenanceAndDiagnostics() {
  const data = await getPage();

  const heroHeading    = data?.heroHeading    || "We diagnose\nwhat others can't.\nThen we fix it.";
  const heroBody       = data?.heroBody       || "Most GSE maintenance providers service one brand, follow one process, and stop when it gets complicated. We don't. AST's diagnostic capability spans multiple manufacturers and equipment types, which means when your ground fleet has a problem, we can actually find it.";
  const sectionHeading = data?.sectionHeading || "Servicing and inspection";
  const sectionBody    = data?.sectionBody    || "Scheduled and unscheduled servicing, pre-delivery inspections, compliance checks. The routine work that keeps equipment legal and operational.";
  const heroImageUrl   = data?.heroImage    ? urlFor(data.heroImage).width(2000).url()  : "/images/iStock_Placeholder.avif";
  const sectionImageUrl = data?.sectionImage ? urlFor(data.sectionImage).width(1256).url() : "/images/iStock_Placeholder.avif";
  const heroLines = heroHeading.split("\n");

  return (
    <MaintenancePageClient
      heroHeading={heroHeading}
      heroBody={heroBody}
      sectionHeading={sectionHeading}
      sectionBody={sectionBody}
      heroImageUrl={heroImageUrl}
      sectionImageUrl={sectionImageUrl}
      heroLines={heroLines}
    />
  );
}
