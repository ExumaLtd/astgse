import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";

export const metadata = {
  title: { absolute: "ASTGSE | Maintenance and diagnostics" },
  description: "AST's diagnostic capability spans multiple manufacturers and equipment types. We diagnose what others can't — then we fix it.",
};

export const revalidate = 60;

async function getPage() {
  return client.fetch(`*[_type == "servicePage" && slug.current == "maintenance-and-diagnostics"][0]`);
}

export default async function MaintenanceAndDiagnostics() {
  const data = await getPage();

  const heroHeading = data?.heroHeading || "We diagnose\nwhat others can't.\nThen we fix it.";
  const heroBody = data?.heroBody || "Most GSE maintenance providers service one brand, follow one process, and stop when it gets complicated. We don't. AST's diagnostic capability spans multiple manufacturers and equipment types, which means when your ground fleet has a problem, we can actually find it.";
  const sectionHeading = data?.sectionHeading || "Servicing and inspection";
  const sectionBody = data?.sectionBody || "Scheduled and unscheduled servicing, pre-delivery inspections, compliance checks. The routine work that keeps equipment legal and operational.";
  const heroImageUrl = data?.heroImage ? urlFor(data.heroImage).width(2000).url() : "/images/iStock_Placeholder.avif";
  const sectionImageUrl = data?.sectionImage ? urlFor(data.sectionImage).width(1256).url() : "/images/iStock_Placeholder.avif";

  const heroLines = heroHeading.split("\n");

  return (
    <div>
      {/* Dark hero — locked to 100vh */}
      <div className="relative h-screen bg-blue text-white flex flex-col overflow-hidden">
        <Navbar />
        <div className="relative z-10 flex flex-col flex-1 min-h-0">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col flex-1 min-h-0">

        <main className="flex flex-col flex-1 min-h-0">
          <div className="page-px">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 pt-4 pb-[40px] lg:pb-[80px]"
            style={{ fontFamily: "var(--font-almaren-nueva)", fontSize: "0.875rem", fontWeight: 21 }}
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors" style={{ color: "rgba(255,255,255,0.40)" }}>Home</Link>
            <span style={{ color: "#00FF7E" }}>/</span>
            <Link href="/services" className="transition-colors" style={{ color: "rgba(255,255,255,0.40)" }}>Services</Link>
            <span style={{ color: "#00FF7E" }}>/</span>
            <span style={{ color: "#ffffff" }}>Maintenance and diagnostics</span>
          </nav>

          {/* Hero — two column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] pb-6 lg:pb-12">
            <div className="lg:col-span-5">
              <h1
                className="text-white text-[2rem] leading-[2.25rem] md:text-[2.75rem] md:leading-[3rem] lg:text-[3.375rem] lg:leading-[3.625rem]"
                style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}
              >
                {heroLines.map((line: string, i: number) => (
                  <span key={i}>
                    {i === heroLines.length - 1 ? (
                      <span style={{ color: "#00ff7e" }}>{line}</span>
                    ) : line}
                    {i < heroLines.length - 1 && <br />}
                  </span>
                ))}
              </h1>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 flex flex-col justify-center gap-[24px] lg:gap-[44px]">
              <p
                className="hidden md:block text-white"
                style={{ fontFamily: "var(--font-inter)", fontSize: "1.125rem", fontWeight: 400, lineHeight: "1.625rem" }}
              >
                {heroBody}
              </p>
              <div>
                <a
                  href="#more"
                  className="inline-flex items-center rounded-full text-[0.9375rem] text-white bg-transparent hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300 ease-out"
                  style={{ fontFamily: "var(--font-inter)", padding: "8px 8px 8px 20px", gap: "12px", border: "1px solid #00FF7E", borderRadius: "100px" }}
                >
                  Learn more
                  <span className="flex items-center justify-center rounded-full bg-[#00FF7E]" style={{ width: 30, height: 30 }}>
                    <ArrowDown size={14} color="#141127" strokeWidth={2.5} />
                  </span>
                </a>
              </div>
            </div>
          </div>
          </div>

          {/* Hero image */}
          <div className="page-px flex-1 min-h-[250px] pb-[25px] lg:pb-[65px]">
            <div className="overflow-hidden w-full h-full" style={{ borderRadius: 22 }}>
              <Image
                src={heroImageUrl}
                alt="GSE maintenance technician at work"
                width={2000}
                height={875}
                className="w-full h-full object-cover object-center"
                priority
                unoptimized={heroImageUrl.startsWith("https://cdn.sanity.io")}
              />
            </div>
          </div>
        </main>
        </div>
        </div>
      </div>

      {/* Blue breathing room on mobile */}
      <div className="h-[25px] bg-blue md:hidden" />

      {/* White section */}
      <div id="more" className="py-[100px] lg:py-[160px]" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-[1440px] mx-auto page-px">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-[40px] lg:gap-[24px]">

            {/* Image — stacks above text on mobile, right column on desktop */}
            <div className="order-first lg:order-none lg:col-span-6 lg:col-start-7 lg:row-start-1">
              <div className="overflow-hidden w-full" style={{ borderRadius: 22, aspectRatio: "628 / 418" }}>
                <Image
                  src={sectionImageUrl}
                  alt="Servicing and inspection"
                  width={628}
                  height={418}
                  className="w-full h-full object-cover"
                  unoptimized={sectionImageUrl.startsWith("https://cdn.sanity.io")}
                />
              </div>
            </div>

            {/* Left: text + CTA */}
            <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1 flex flex-col gap-[20px] lg:gap-[50px]">
              <div className="flex flex-col" style={{ gap: 30 }}>
                <h2
                  className="text-[2rem] leading-[2.25rem] md:text-[2.75rem] md:leading-[3rem] lg:text-[3.375rem] lg:leading-[3.625rem]"
                  style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21, color: "#151129", maxWidth: "25.6875rem" }}
                >
                  {sectionHeading}
                </h2>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", fontWeight: 400, lineHeight: "1.5rem", color: "#151129", maxWidth: "32.4375rem" }}>
                  {sectionBody}
                </p>
              </div>
              <div>
                <a
                  href="#"
                  className="inline-flex items-center"
                  style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", padding: "8px 8px 8px 20px", gap: 12, backgroundColor: "#00FF7E", color: "#141127", borderRadius: 100, border: "1px solid #00FF7E" }}
                >
                  Enquire now
                  <span className="flex items-center justify-center rounded-full bg-[#141127]" style={{ width: 30, height: 30 }}>
                    <ArrowRight size={14} color="#00FF7E" strokeWidth={2.5} />
                  </span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
