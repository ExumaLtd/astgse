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
          <div className="grid grid-cols-12 gap-6 pb-12">
            {/* Left: heading */}
            <div className="col-span-6">
              <h1
                className="text-white font-semibold tracking-tight"
                style={{
                  fontFamily: "var(--font-almaren-nueva)",
                  fontSize: "72px",
                  lineHeight: 1.1,
                }}
              >
                We diagnose<br />
                what others can&apos;t.<br />
                <span style={{ color: "#00ff7e" }}>Then we fix it.</span>
              </h1>
            </div>

            {/* Right: body + CTA */}
            <div className="col-span-5 col-start-8 flex flex-col justify-center gap-8">
              <p
                className="text-white/75 leading-relaxed"
                style={{ fontFamily: "var(--font-inter)", fontSize: "18px", lineHeight: 1.6 }}
              >
                Most GSE maintenance providers service one brand, follow one process, and stop when it gets complicated. We don&apos;t. AST&apos;s diagnostic capability spans multiple manufacturers and equipment types, which means when your ground fleet has a problem, we can actually find it.
              </p>

              <div>
                <a
                  href="#more"
                  className="inline-flex items-center gap-3 border border-white/30 rounded-full pl-6 pr-2 py-2 text-white text-[15px] hover:border-white/60 transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Learn more
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-green">
                    <ArrowDown size={16} color="#141127" />
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
