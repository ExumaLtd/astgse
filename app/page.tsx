import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";

export const metadata: Metadata = {
  title: { absolute: "ASTGSE | Homepage" },
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
        style={{ objectPosition: "30% center" }}
        src="/videos/gettyimages-2192368667-640_adpp.mp4"
      />

      {/* Overlay with blur */}
      <div className="absolute inset-0 backdrop-blur-[8px]" style={{ backgroundColor: "rgba(20,17,39,0.50)" }} />

      {/* Navbar — full width */}
      <Navbar />

      {/* Content — full width, heading centred, subtext at bottom */}
      <div className="relative z-10 flex flex-col flex-1 w-full px-[20px] md:px-[32px] lg:px-[80px]" style={{ paddingBottom: 65 }}>

        {/* Heading — vertically centred */}
        <div className="flex flex-1 items-center">
          <h1
            className="text-white text-[2.75rem] leading-[3rem] md:text-[3.25rem] md:leading-[3.625rem] lg:text-[4.375rem] lg:leading-[5rem]"
            style={{
              fontFamily: "var(--font-almaren-nueva)",
              fontWeight: 21,
              maxWidth: "29.75rem",
            }}
          >
            <span style={{ backgroundColor: "#00FF7E", color: "#141127" }}>Every aircraft.</span><br />
            Every airport.<br />
            Every day.
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
