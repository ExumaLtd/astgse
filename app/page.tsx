import Navbar from "@/app/components/Navbar";

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

      {/* Navbar */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 justify-between" style={{ paddingLeft: 80, paddingRight: 80, paddingBottom: 65 }}>
        {/* Spacer pushes heading down */}
        <div className="flex-1" />

        {/* Hero heading */}
        <h1
          className="text-white"
          style={{
            fontFamily: "var(--font-almaren-nueva)",
            fontSize: 70,
            fontWeight: 21,
            lineHeight: "80px",
            maxWidth: 476,
            marginBottom: 80,
          }}
        >
          Every Aircraft.<br />
          Every Airport.<br />
          Every Day.
        </h1>

        {/* Subtext — bottom */}
        <p
          className="text-white"
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: 15,
            fontWeight: 400,
            lineHeight: "normal",
            textTransform: "uppercase",
            maxWidth: 534,
          }}
        >
          From a single hard-to-find unit to full ground fleet support, we provide the equipment, expertise and backup that keeps your airside operation running.
        </p>
      </div>
    </div>
  );
}
