"use client";

import { useRef, useState } from "react";
import { Globe } from "lucide-react";
import { LANGUAGES } from "@/app/i18n/config";

const Chevron = ({ open }: { open?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none"
    className="transition-transform duration-200"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <path d="M0.75 0.75L4.75 4.75L8.75 0.75" stroke="#00FF7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


interface Props {
  lang: string;
  onSwitch: (code: string) => void;
  /** "hover" for desktop, "click" for mobile */
  trigger?: "hover" | "click";
  /** Align dropdown to left or right of trigger */
  dropdownAlign?: "left" | "right";
}

export default function LanguageSwitcher({
  lang,
  onSwitch,
  trigger = "click",
  dropdownAlign = "left",
}: Props) {
  const [open, setOpen] = useState(false);
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function langColor(code: string) {
    if (hoveredLang === code) return "#00FF7E";
    if (hoveredLang !== null) return "white";
    return lang === code ? "#00FF7E" : "white";
  }

  function handleMouseEnter() {
    if (trigger !== "hover") return;
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    setOpen(true);
  }

  function handleMouseLeave() {
    if (trigger !== "hover") return;
    leaveTimeout.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      translate="no"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => trigger === "click" && setOpen((v) => !v)}
        className="group flex items-center text-white transition-colors duration-200 cursor-pointer"
        style={{ background: "none", border: "none", padding: 0, fontFamily: "var(--font-inter)", fontSize: "0.9375rem" }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe size={14} strokeWidth={1.5} className="shrink-0" />
        <span
          className="group-hover:text-[#00FF7E] transition-colors duration-200"
          style={{ marginLeft: 8, marginRight: 12 }}
        >
          {lang}
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 flex flex-col overflow-hidden z-50"
          style={{
            backgroundColor: "#141127",
            borderRadius: 8,
            ...(dropdownAlign === "right" ? { right: 0 } : { left: "50%", transform: "translateX(-50%)" }),
          }}
          role="listbox"
        >
          {LANGUAGES.map(({ code }) => (
            <button
              key={code}
              role="option"
              aria-selected={lang === code}
              onClick={() => { onSwitch(code); setOpen(false); }}
              onMouseEnter={() => setHoveredLang(code)}
              onMouseLeave={() => setHoveredLang(null)}
              className="transition-colors duration-150 text-center"
              style={{
                padding: "8px 16px",
                fontFamily: "var(--font-inter)",
                fontSize: "0.9375rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: langColor(code),
              }}
            >
              {code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
