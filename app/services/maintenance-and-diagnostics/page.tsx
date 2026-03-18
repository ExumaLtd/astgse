import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: "Maintenance and Diagnostics | AST GSE",
  description: "AST's diagnostic capability spans multiple manufacturers and equipment types. We diagnose what others can't — then we fix it.",
};

export default function MaintenanceAndDiagnostics() {
  return (
    <div className="min-h-screen bg-blue text-white">
      <Navbar />

      <main className="px-10">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-2 text-label text-white/40 pt-4 pb-12 font-[var(--font-inter)]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-white/70 transition-colors">Services</Link>
          <span>/</span>
          <span className="text-white/70">Maintenance and diagnostics</span>
        </nav>

        {/* Hero — two column */}
        <div className="grid grid-cols-12 gap-3 pb-12">
          {/* Left: heading — spans ~6 cols */}
          <div className="col-span-6">
            <h1
              className="text-hero font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-almaren-nueva)" }}
            >
              We diagnose<br />
              what others can&apos;t.<br />
              <span className="text-green">Then we fix it.</span>
            </h1>
          </div>

          {/* Right: body + CTA — spans 5 cols, starts at col 8 */}
          <div className="col-span-5 col-start-8 flex flex-col justify-center gap-6">
            <p
              className="text-body text-white/75 leading-relaxed"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Most GSE maintenance providers service one brand, follow one process, and stop when it gets complicated. We don&apos;t. AST&apos;s diagnostic capability spans multiple manufacturers and equipment types, which means when your ground fleet has a problem, we can actually find it.
            </p>

            <div>
              <a
                href="#more"
                className="inline-flex items-center gap-3 border border-white/30 rounded-full pl-6 pr-2 py-2 text-white text-body-sm font-[var(--font-inter)] hover:border-white/60 transition-colors"
              >
                Learn more
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-green">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M4 9l4 4 4-4" stroke="#141127" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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
  );
}
