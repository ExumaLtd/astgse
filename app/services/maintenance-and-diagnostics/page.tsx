import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/app/components/navigation/Navbar";
import ScrollButton from "@/app/components/ui/ScrollButton";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";

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

  const heroHeading   = data?.heroHeading   || "We diagnose\nwhat others can't.\nThen we fix it.";
  const heroBody      = data?.heroBody      || "Most GSE maintenance providers service one brand, follow one process, and stop when it gets complicated. We don't. AST's diagnostic capability spans multiple manufacturers and equipment types, which means when your ground fleet has a problem, we can actually find it.";
  const sectionHeading = data?.sectionHeading || "Servicing and inspection";
  const sectionBody   = data?.sectionBody   || "Scheduled and unscheduled servicing, pre-delivery inspections, compliance checks. The routine work that keeps equipment legal and operational.";
  const heroImageUrl   = data?.heroImage    ? urlFor(data.heroImage).width(2000).url()  : "/images/iStock_Placeholder.avif";
  const sectionImageUrl = data?.sectionImage ? urlFor(data.sectionImage).width(1256).url() : "/images/iStock_Placeholder.avif";

  const heroLines = heroHeading.split("\n");

  return (
    <div className="maintenance-page">

      {/* ── Dark hero section ─────────────────────────────────────────────── */}
      <section className="maintenance-hero relative bg-blue text-white flex flex-col overflow-hidden md:h-screen">
        <Navbar />

        <div className="relative z-10 flex flex-col md:flex-1 md:min-h-0">
          <div className="max-w-[1440px] mx-auto w-full flex flex-col md:flex-1 md:min-h-0">
            <main className="flex flex-col pb-[40px] md:pb-0 md:flex-1 md:min-h-0">

              <div className="page-px">
                {/* Breadcrumb */}
                <nav
                  className="maintenance-breadcrumb flex items-center gap-[12px] pt-[10px] md:pt-4 pb-[30px] md:pb-[40px] lg:pb-[80px]"
                  style={{ fontFamily: "var(--font-almaren-nueva)", fontSize: "0.875rem", fontWeight: 21 }}
                  aria-label="Breadcrumb"
                >
                  <Link href="/" className="maintenance-breadcrumb__link transition-colors" style={{ color: "rgba(255,255,255,0.40)" }}>Home</Link>
                  <span className="maintenance-breadcrumb__separator" style={{ color: "#00FF7E" }}>/</span>
                  <Link href="/services" className="maintenance-breadcrumb__link transition-colors" style={{ color: "rgba(255,255,255,0.40)" }}>Services</Link>
                  <span className="maintenance-breadcrumb__separator" style={{ color: "#00FF7E" }}>/</span>
                  <span className="maintenance-breadcrumb__current" style={{ color: "#ffffff" }}>Maintenance and diagnostics</span>
                </nav>

                {/* Hero columns */}
                <div className="maintenance-hero__grid grid grid-cols-1 lg:grid-cols-12 gap-[24px] pb-6 lg:pb-12">
                  <div className="maintenance-hero__heading-col lg:col-span-5">
                    <h1
                      className="maintenance-hero__heading text-white text-[2rem] leading-[2.25rem] md:text-[2.75rem] md:leading-[3rem] lg:text-[3.375rem] lg:leading-[3.625rem]"
                      style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}
                    >
                      {heroLines.map((line: string, i: number) => (
                        <span key={i} className="maintenance-hero__heading-line">
                          {i === heroLines.length - 1 ? (
                            <span className="maintenance-hero__heading-highlight" style={{ color: "#00ff7e" }}>{line}</span>
                          ) : line}
                          {i < heroLines.length - 1 && <br />}
                        </span>
                      ))}
                    </h1>
                  </div>

                  <div className="maintenance-hero__body-col lg:col-span-6 lg:col-start-7 flex flex-col justify-center gap-[24px] lg:gap-[44px]">
                    <p
                      className="maintenance-hero__body text-white md:text-[1.125rem]"
                      style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", fontWeight: 400, lineHeight: "1.5rem" }}
                    >
                      {heroBody}
                    </p>
                    <div className="maintenance-hero__cta">
                      <ScrollButton targetId="more" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero image */}
              <div className="maintenance-hero__image-wrap page-px md:flex-1 md:min-h-[250px] md:pb-[65px]">
                <div className="overflow-hidden w-full aspect-[628/418] md:aspect-auto md:h-full" style={{ borderRadius: 22 }}>
                  <Image
                    src={heroImageUrl}
                    alt="GSE maintenance technician at work"
                    width={2000}
                    height={875}
                    className="maintenance-hero__image w-full h-full object-cover object-center"
                    priority
                  />
                </div>
              </div>

            </main>
          </div>
        </div>
      </section>

      {/* ── White content section ─────────────────────────────────────────── */}
      <section id="more" className="maintenance-section py-[100px] lg:py-[160px]" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-[1440px] mx-auto page-px">
          <div className="maintenance-section__grid grid grid-cols-1 lg:grid-cols-12 items-center gap-[40px] lg:gap-[24px]">

            {/* Image — stacks above on mobile, right column on desktop */}
            <div className="maintenance-section__image-col order-first lg:order-none lg:col-span-6 lg:col-start-7 lg:row-start-1">
              <div className="overflow-hidden w-full" style={{ borderRadius: 22, aspectRatio: "628 / 418" }}>
                <Image
                  src={sectionImageUrl}
                  alt="Servicing and inspection"
                  width={628}
                  height={418}
                  className="maintenance-section__image w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text + CTA */}
            <div className="maintenance-section__text-col lg:col-span-5 lg:col-start-1 lg:row-start-1 flex flex-col gap-[20px] lg:gap-[50px]">
              <div className="maintenance-section__text flex flex-col" style={{ gap: 30 }}>
                <h2
                  className="maintenance-section__heading text-[2rem] leading-[2.25rem] md:text-[2.75rem] md:leading-[3rem] lg:text-[3.375rem] lg:leading-[3.625rem]"
                  style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21, color: "#151129", maxWidth: "25.6875rem" }}
                >
                  {sectionHeading}
                </h2>
                <p
                  className="maintenance-section__body"
                  style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", fontWeight: 400, lineHeight: "1.5rem", color: "#151129", maxWidth: "32.4375rem" }}
                >
                  {sectionBody}
                </p>
              </div>

              <div className="maintenance-section__cta">
                <a
                  href="#"
                  className="maintenance-section__cta-btn inline-flex items-center"
                  style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", paddingBlock: 8, paddingInlineStart: 20, paddingInlineEnd: 8, gap: 12, backgroundColor: "#00FF7E", color: "#141127", borderRadius: 100, border: "1px solid #00FF7E" }}
                >
                  Enquire now
                  <span className="flex items-center justify-center rounded-full bg-[#141127] rtl:rotate-180" style={{ width: 30, height: 30 }}>
                    <ArrowRight size={14} color="#00FF7E" strokeWidth={2.5} />
                  </span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
