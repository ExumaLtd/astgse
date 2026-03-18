import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";

export const metadata: Metadata = {
  title: "Homepage",
};

export default function Home() {
  return (
    <div className="relative h-screen overflow-hidden bg-blue flex flex-col">
      {/* Full-screen video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/gettyimages-2192368667-640_adpp.mp4"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-[#141127]/50" />

      {/* Navbar — full width */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Content — full width, heading centred, subtext at bottom */}
      <div className="relative z-10 flex flex-col flex-1 w-full" style={{ paddingLeft: 80, paddingRight: 80, paddingBottom: 65 }}>

        {/* Heading — vertically centred */}
        <div className="flex flex-1 items-center">
          <h1
            className="text-white"
            style={{
              fontFamily: "var(--font-almaren-nueva)",
              fontSize: "4.375rem",
              fontWeight: 21,
              lineHeight: "5rem",
              maxWidth: "29.75rem",
            }}
          >
            Every Aircraft.<br />
            Every Airport.<br />
            Every Day.
          </h1>
        </div>

        {/* Subtext — pinned to bottom */}
        <p
          className="text-white"
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "0.9375rem",
            fontWeight: 400,
            lineHeight: "normal",
            textTransform: "uppercase",
            maxWidth: "33.375rem",
          }}
        >
          From a single hard-to-find unit to full ground fleet support, we provide the equipment, expertise and backup that keeps your airside operation running.
        </p>
      </div>
    </div>
  );
}
