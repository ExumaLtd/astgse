import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: "Maintenance and Diagnostics | AST GSE",
  description: "AST's diagnostic capability spans multiple manufacturers and equipment types. We diagnose what others can't — then we fix it.",
};

export default function MaintenanceAndDiagnostics() {
  return (
    <div className="min-h-screen bg-blue text-white">
      <div className="max-w-[1440px] mx-auto">
        <Navbar />

        <main>
          <div style={{ paddingLeft: 80, paddingRight: 80 }}>
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 pt-4 pb-[80px]"
            style={{
              fontFamily: "var(--font-almaren-nueva)",
              fontSize: "14px",
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
          <div className="grid grid-cols-12 gap-[24px] pb-12">
            {/* Left: heading */}
            <div className="col-span-5">
              <h1
                className="text-white"
                style={{
                  fontFamily: "var(--font-almaren-nueva)",
                  fontSize: "54px",
                  fontWeight: 21,
                  lineHeight: "58px",
                }}
              >
                We diagnose<br />
                what others can&apos;t.<br />
                <span style={{ color: "#00ff7e" }}>Then we fix it.</span>
              </h1>
            </div>

            {/* Right: body + CTA */}
            <div className="col-span-6 col-start-7 flex flex-col justify-center gap-8">
              <p
                className="text-white"
                style={{ fontFamily: "var(--font-inter)", fontSize: "18px", fontWeight: 400, lineHeight: "26px" }}
              >
                Most GSE maintenance providers service one brand, follow one process, and stop when it gets complicated. We don&apos;t. AST&apos;s diagnostic capability spans multiple manufacturers and equipment types, which means when your ground fleet has a problem, we can actually find it.
              </p>

              <div>
                <a
                  href="#more"
                  className="inline-flex items-center rounded-full text-[15px] text-white bg-transparent hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300 ease-out"
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

          {/* Full-width image — 25px from page edges */}
          <div style={{ paddingLeft: 25, paddingRight: 25 }}>
            <div className="overflow-hidden w-full aspect-[16/7]" style={{ borderRadius: 22 }}>
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
    </div>
  );
}
