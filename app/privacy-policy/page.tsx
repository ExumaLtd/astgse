import Link from "next/link";
import Navbar from "@/app/components/navigation/Navbar";

export const metadata = {
  title: { absolute: "ASTGSE | Privacy policy" },
  robots: { index: false },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-blue text-white flex flex-col">
      <Navbar />
      <main className="page-px flex flex-col flex-1 max-w-[1440px] mx-auto w-full pb-[80px]">

        <nav
          className="flex items-center gap-[12px] pt-[10px] md:pt-4 mb-[40px] md:mb-[64px]"
          style={{ fontFamily: "var(--font-almaren-nueva)", fontSize: "0.875rem", fontWeight: 21 }}
          aria-label="Breadcrumb"
        >
          <Link href="/" style={{ color: "rgba(255,255,255,0.40)" }}>Home</Link>
          <span style={{ color: "#00FF7E" }}>/</span>
          <span style={{ color: "#ffffff" }}>Privacy policy</span>
        </nav>

        <div className="flex flex-col gap-[32px] max-w-[720px]">
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", color: "#ffffff", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#00FF7E" }}>/</span> Legal
          </p>
          <h1
            className="text-[2rem] leading-[2.25rem] md:text-[2.75rem] md:leading-[3rem] lg:text-[3.375rem] lg:leading-[3.625rem]"
            style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}
          >
            Privacy policy
          </h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "1.125rem", lineHeight: "1.875rem", color: "rgba(255,255,255,0.75)" }}>
            This privacy policy will be updated before launch. If you have any questions in the meantime, please contact us at{" "}
            <a href="mailto:enquiries@astgse.com" translate="no" className="text-white underline hover:text-[#00FF7E] transition-colors duration-200">
              enquiries@astgse.com
            </a>.
          </p>
        </div>

      </main>
    </div>
  );
}
