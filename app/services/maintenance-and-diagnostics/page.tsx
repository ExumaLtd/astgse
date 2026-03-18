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

        <main className="px-10">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 text-[13px] text-white/40 pt-4 pb-12"
            style={{ fontFamily: "var(--font-inter)" }}
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-white/70 transition-colors">Services</Link>
            <span>/</span>
            <span className="text-white/70">Maintenance and diagnostics</span>
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
                  className="inline-flex items-center rounded-full text-white text-[15px] transition-all hover:bg-[#00FF7E]/10 group"
                  style={{
                    fontFamily: "var(--font-inter)",
                    padding: "8px 8px 8px 20px",
                    gap: "12px",
                    border: "1px solid #00FF7E",
                    borderRadius: "100px",
                  }}
                >
                  Learn more
                  <span className="flex items-center justify-center rounded-full bg-[#00FF7E] transition-transform group-hover:scale-105" style={{ width: 30, height: 30 }}>
                    <ArrowDown size={14} color="#141127" strokeWidth={2.5} />
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Full-width image */}
          <div className="rounded-2xl overflow-hidden w-full aspect-[16/7]">
            <Image
              src="/images/iStock_Placeholder.avif"
              alt="GSE maintenance technician at work"
              width={2000}
              height={875}
              className="w-full h-full object-cover object-center"
              priority
            />
          </div>
        </main>
      </div>
    </div>
  );
}
