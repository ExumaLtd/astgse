import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: { absolute: "ASTGSE | Maintenance and diagnostics" },
  description: "AST's diagnostic capability spans multiple manufacturers and equipment types. We diagnose what others can't — then we fix it.",
};

export default function MaintenanceAndDiagnostics() {
  return (
    <div>
      {/* Dark hero — locked to 100vh */}
      <div className="relative h-screen bg-blue text-white flex flex-col overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/iStock_Placeholder.avif"
          alt=""
          fill
          className="object-cover object-center"
          priority
          aria-hidden="true"
        />
        {/* Dark overlay with blur */}
        <div className="absolute inset-0 backdrop-blur-[12px]" style={{ backgroundColor: "rgba(20,17,39,0.50)" }} />
        <Navbar />
        <div className="relative z-10 flex flex-col flex-1 min-h-0">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col flex-1 min-h-0">

        <main className="flex flex-col flex-1 min-h-0">
          <div className="px-[20px] md:px-[32px] lg:px-[80px]">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 pt-4 pb-[80px]"
            style={{
              fontFamily: "var(--font-almaren-nueva)",
              fontSize: "0.875rem",
              fontWeight: 21,
            }}
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors" style={{ color: "rgba(255,255,255,0.40)" }}>Home</Link>
            <span style={{ color: "#00FF7E" }}>/</span>
            <Link href="/services" className="transition-colors" style={{ color: "rgba(255,255,255,0.40)" }}>Services</Link>
            <span style={{ color: "#00FF7E" }}>/</span>
            <span style={{ color: "#ffffff" }}>Maintenance and diagnostics</span>
          </nav>

          {/* Hero — two column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] pb-12">
            {/* Left: heading */}
            <div className="lg:col-span-5">
              <h1
                className="text-white text-[2rem] leading-[2.25rem] md:text-[2.75rem] md:leading-[3rem] lg:text-[3.375rem] lg:leading-[3.625rem]"
                style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}
              >
                We diagnose<br />
                what others can&apos;t.<br />
                <span style={{ color: "#00ff7e" }}>Then we fix it.</span>
              </h1>
            </div>

            {/* Right: body + CTA */}
            <div className="lg:col-span-6 lg:col-start-7 flex flex-col justify-center" style={{ gap: 44 }}>
              <p
                className="text-white"
                style={{ fontFamily: "var(--font-inter)", fontSize: "1.125rem", fontWeight: 400, lineHeight: "1.625rem" }}
              >
                Most GSE maintenance providers service one brand, follow one process, and stop when it gets complicated. We don&apos;t. AST&apos;s diagnostic capability spans multiple manufacturers and equipment types, which means when your ground fleet has a problem, we can actually find it.
              </p>

              <div>
                <a
                  href="#more"
                  className="inline-flex items-center rounded-full text-[0.9375rem] text-white bg-transparent hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300 ease-out"
                  style={{
                    fontFamily: "var(--font-inter)",
                    padding: "8px 8px 8px 20px",
                    gap: "12px",
                    border: "1px solid #00FF7E",
                    borderRadius: "100px",
                  }}
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

          {/* Full-width image — 25px from edges, 65px from bottom, fills remaining vh */}
          <div className="flex-1 min-h-0" style={{ paddingLeft: 25, paddingRight: 25, paddingBottom: 65 }}>
            <div className="overflow-hidden w-full h-full" style={{ borderRadius: 22 }}>
              <Image
                src="/images/iStock_Placeholder.avif"
                alt="GSE maintenance technician at work"
                width={2000}
                height={875}
                className="w-full h-full object-cover object-center"
                priority
              />
            </div>
          </div>
        </main>
        </div>
        </div>{/* end z-10 wrapper */}
      </div>

      {/* White section */}
      <div id="more" style={{ backgroundColor: "#ffffff", paddingTop: 160, paddingBottom: 160 }}>
        <div className="max-w-[1440px] mx-auto px-[20px] md:px-[32px] lg:px-[80px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center" style={{ gap: 24 }}>

            {/* Left: text + CTA */}
            <div className="lg:col-span-5 flex flex-col" style={{ gap: 50 }}>
              <div className="flex flex-col" style={{ gap: 30 }}>
                <h2
                  className="text-[2rem] leading-[2.25rem] md:text-[2.75rem] md:leading-[3rem] lg:text-[3.375rem] lg:leading-[3.625rem]"
                  style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21, color: "#151129", maxWidth: "25.6875rem" }}
                >
                  Servicing and inspection
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "1rem",
                    fontWeight: 400,
                    lineHeight: "1.5rem",
                    color: "#151129",
                    maxWidth: "32.4375rem",
                  }}
                >
                  Scheduled and unscheduled servicing, pre-delivery inspections, compliance checks. The routine work that keeps equipment legal and operational.
                </p>
              </div>

              {/* Enquire now button — always filled green */}
              <div>
                <a
                  href="#"
                  className="inline-flex items-center"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "0.9375rem",
                    padding: "8px 8px 8px 20px",
                    gap: 12,
                    backgroundColor: "#00FF7E",
                    color: "#141127",
                    borderRadius: 100,
                    border: "1px solid #00FF7E",
                  }}
                >
                  Enquire now
                  <span className="flex items-center justify-center rounded-full bg-[#141127]" style={{ width: 30, height: 30 }}>
                    <ArrowRight size={14} color="#00FF7E" strokeWidth={2.5} />
                  </span>
                </a>
              </div>
            </div>

            {/* Right: image */}
            <div className="lg:col-span-6 lg:col-start-7">
              <div className="overflow-hidden w-full" style={{ borderRadius: 22, aspectRatio: "628 / 418" }}>
                <Image
                  src="/images/iStock_Placeholder.avif"
                  alt="Servicing and inspection"
                  width={628}
                  height={418}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
