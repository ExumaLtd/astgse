"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="relative h-screen bg-blue flex flex-col items-center justify-center text-white"
      style={{ fontFamily: "var(--font-inter)" }}>
      <p className="text-[#00FF7E] text-sm uppercase tracking-widest mb-4">Something went wrong</p>
      <h1 className="text-3xl mb-8" style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}>
        Unable to load this page
      </h1>
      <button
        onClick={reset}
        className="inline-flex items-center rounded-full text-white hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300"
        style={{ paddingBlock: 8, paddingInlineStart: 20, paddingInlineEnd: 20, border: "1px solid #00FF7E", borderRadius: 100 }}
      >
        Try again
      </button>
    </div>
  );
}
