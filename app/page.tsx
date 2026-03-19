import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";

export const metadata: Metadata = {
  title: { absolute: "ASTGSE | Homepage" },
};

export const revalidate = 60;

async function getHomepage() {
  return client.fetch(`*[_type == "homepage"][0]`);
}

export default async function Home() {
  const data = await getHomepage();

  const heading = data?.heroHeading || "Every aircraft.\nEvery airport.\nEvery day.";
  const subtext = data?.heroSubtext || "From a single hard-to-find unit to full ground fleet support, we provide the equipment, expertise and backup that keeps your airside operation running.";
  const lines = heading.split("\n");
  const bgImage = data?.backgroundImage ? urlFor(data.backgroundImage).width(1920).url() : null;

  return (
    <div className="relative h-screen overflow-hidden bg-blue flex flex-col">
      {/* Background — image if set, otherwise video */}
      {bgImage ? (
        <img
          src={bgImage}
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "30% center" }}
        />
      ) : (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "30% center" }}
          src="/videos/gettyimages-2192368667-640_adpp.mp4"
        />
      )}

      {/* Overlay with blur */}
      <div className="absolute inset-0 backdrop-blur-[8px]" style={{ backgroundColor: "rgba(20,17,39,0.50)" }} />

      {/* Navbar — full width */}
      <Navbar />

      {/* Content */}
      <div className="page-px relative z-10 flex flex-col flex-1 w-full" style={{ paddingBottom: 65 }}>
        <div className="flex flex-1 items-center">
          <h1
            className="text-white text-[2.75rem] leading-[3rem] md:text-[3.25rem] md:leading-[3.625rem] lg:text-[4.375rem] lg:leading-[5rem]"
            style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21, maxWidth: "29.75rem" }}
          >
            {lines.map((line: string, i: number) => (
              <span key={i}>
                {i === 0 ? (
                  <span style={{ backgroundColor: "#00FF7E", color: "#141127" }}>{line}</span>
                ) : line}
                {i < lines.length - 1 && <br />}
              </span>
            ))}
          </h1>
        </div>

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
          {subtext}
        </p>
      </div>
    </div>
  );
}
