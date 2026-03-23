import Link from "next/link";
import Navbar from "@/app/components/navigation/Navbar";

export default function ContactSuccess() {
  return (
    <div className="min-h-screen bg-blue text-white flex flex-col">
      <Navbar />
      <main className="page-px flex flex-col flex-1 max-w-[1440px] mx-auto w-full pb-[40px] md:pb-[80px]">

        <nav
          className="flex items-center gap-[12px] pt-[10px] md:pt-4 mb-[40px] md:mb-[64px]"
          style={{ fontFamily: "var(--font-almaren-nueva)", fontSize: "0.875rem", fontWeight: 21 }}
          aria-label="Breadcrumb"
        >
          <Link href="/" style={{ color: "rgba(255,255,255,0.40)" }}>Home</Link>
          <span style={{ color: "#00FF7E" }}>/</span>
          <Link href="/contact" style={{ color: "rgba(255,255,255,0.40)" }}>Contact</Link>
          <span style={{ color: "#00FF7E" }}>/</span>
          <span style={{ color: "#ffffff" }}>Form submitted successfully</span>
        </nav>

        <div className="flex flex-col gap-[32px] max-w-[720px]">
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", color: "#ffffff", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#00FF7E" }}>/</span> Thank you for contacting us
          </p>
          <h1 style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21, fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.1 }}>
            Your message has been received and{" "}
            <span style={{ color: "#00FF7E" }}>a member of our team will respond within 1 working day.</span>
          </h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", color: "#ffffff", lineHeight: 1.6 }}>
            For urgent enquiries, please call us directly on{" "}
            <a href="tel:+447544309803" translate="no" dir="ltr" className="text-white hover:text-[#00FF7E] transition-colors duration-200">+44 (0)7544 309803</a>.
          </p>
        </div>

      </main>
    </div>
  );
}
