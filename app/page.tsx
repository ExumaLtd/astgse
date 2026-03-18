import Navbar from "@/app/components/Navbar";

export default function Home() {
  return (
    <div className="relative h-screen overflow-hidden bg-blue">
      {/* Full-screen video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/gettyimages-2192368667-640_adpp.mp4"
      />

      {/* Dark overlay so nav stays readable */}
      <div className="absolute inset-0 bg-[#141127]/40" />

      {/* Navbar on top */}
      <div className="relative z-10">
        <Navbar />
      </div>
    </div>
  );
}
