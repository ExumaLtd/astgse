"use client";

import { ArrowDown } from "lucide-react";

export default function ScrollButton({ targetId }: { targetId: string }) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center rounded-full text-[0.9375rem] text-white bg-transparent hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300 ease-out cursor-pointer"
      style={{ fontFamily: "var(--font-inter)", paddingBlock: 8, paddingInlineStart: 20, paddingInlineEnd: 8, gap: "12px", border: "1px solid #00FF7E", borderRadius: "100px" }}
    >
      Learn more
      <span className="flex items-center justify-center rounded-full bg-[#00FF7E]" style={{ width: 30, height: 30 }}>
        <ArrowDown size={14} color="#141127" strokeWidth={2.5} />
      </span>
    </button>
  );
}
