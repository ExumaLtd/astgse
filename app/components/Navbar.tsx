"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Menu, X, Globe } from "lucide-react";
import { translatePage } from "@/app/utils/translate";

const Chevron = ({ open }: { open?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none"
    className="transition-transform duration-200"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <path d="M0.75 0.75L4.75 4.75L8.75 0.75" stroke="#00FF7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("EN");
  const [langOpen, setLangOpen] = useState(false);
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);

  const desktopLangRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const inDesktop = desktopLangRef.current?.contains(e.target as Node);
      const inMobile = mobileLangRef.current?.contains(e.target as Node);
      if (!inDesktop && !inMobile) setLangOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function langColor(l: string) {
    if (hoveredLang === l) return "#00FF7E";
    if (hoveredLang !== null) return "white";
    return lang === l ? "#00FF7E" : "white";
  }

  function switchLanguage(l: string) {
    setLang(l);
    setLangOpen(false);
    translatePage(l === "AR" ? "ar" : "en");
  }

  return (
    <>
      <nav className="page-px flex items-center justify-between w-full relative z-50 h-[80px]">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/astgse_Logo_Web_White.svg" alt="AST GSE" width={91} height={27} className="block" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center" style={{ gap: 40 }}>
          <ul className="flex items-center text-white text-[0.9375rem]" style={{ fontFamily: "var(--font-inter)", gap: "40px" }}>
            <li>
              <Link href="/services/maintenance-and-diagnostics" className="flex items-center group text-white transition-colors duration-200" style={{ gap: "12px" }}>
                Services
                <Chevron />
              </Link>
            </li>
            <li>
              <button className="flex items-center group text-white transition-colors duration-200" style={{ gap: "12px", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-inter)", fontSize: "0.9375rem" }}>
                Equipment
                <Chevron />
              </button>
            </li>
            <li>
              <Link href="/about" className="text-white transition-colors duration-200">About</Link>
            </li>
            <li>
              <Link href="/careers" className="text-white transition-colors duration-200">Careers</Link>
            </li>
            <li>
              <Link href="/newsroom" className="text-white transition-colors duration-200">Newsroom</Link>
            </li>
          </ul>

          <div className="flex items-center" style={{ gap: 28 }}>
            <Link
              href=""
              className="inline-flex items-center rounded-full text-white text-[0.9375rem] hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300 ease-out"
              style={{ fontFamily: "var(--font-inter)", padding: "6px 6px 6px 20px", gap: "12px", border: "1px solid #00FF7E", borderRadius: "100px" }}
            >
              Contact us
              <span className="flex items-center justify-center rounded-full bg-[#00FF7E]" style={{ width: 26, height: 26 }}>
                <ArrowRight size={13} color="#141127" strokeWidth={2.5} />
              </span>
            </Link>

            <button className="text-white hover:text-[#00FF7E] transition-colors duration-200 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M12.75 12.75L9.85667 9.85667M11.4167 6.08333C11.4167 9.02885 9.02885 11.4167 6.08333 11.4167C3.13781 11.4167 0.75 9.02885 0.75 6.08333C0.75 3.13781 3.13781 0.75 6.08333 0.75C9.02885 0.75 11.4167 3.13781 11.4167 6.08333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Language switcher */}
            <div ref={desktopLangRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center text-white transition-colors duration-200 cursor-pointer"
                style={{ gap: 12, background: "none", border: "none", padding: 0, fontFamily: "var(--font-inter)", fontSize: "0.9375rem" }}
              >
                <Globe size={14} strokeWidth={1.5} />
                <span>{lang}</span>
                <Chevron open={langOpen} />
              </button>
              {langOpen && (
                <div className="absolute top-full mt-2 flex flex-col overflow-hidden z-50" style={{ backgroundColor: "#141127", borderRadius: 8, left: "50%", transform: "translateX(-50%)" }}>
                  {["EN", "AR"].map((l) => (
                    <button
                      key={l}
                      onClick={() => switchLanguage(l)}
                      onMouseEnter={() => setHoveredLang(l)}
                      onMouseLeave={() => setHoveredLang(null)}
                      className="transition-colors duration-150 text-center"
                      style={{ padding: "8px 16px", fontFamily: "var(--font-inter)", fontSize: "0.9375rem", background: "none", border: "none", cursor: "pointer", color: langColor(l) }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile right — language + burger */}
        <div className="flex lg:hidden items-center" style={{ gap: 20 }}>
          <div ref={mobileLangRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center text-white transition-colors duration-200 cursor-pointer"
              style={{ gap: 12, background: "none", border: "none", padding: 0, fontFamily: "var(--font-inter)", fontSize: "0.9375rem" }}
            >
              <Globe size={14} strokeWidth={1.5} />
              <span>{lang}</span>
              <Chevron open={langOpen} />
            </button>
            {langOpen && (
              <div className="absolute top-full mt-2 flex flex-col overflow-hidden z-50" style={{ backgroundColor: "#141127", borderRadius: 8, right: 0 }}>
                {["EN", "AR"].map((l) => (
                  <button
                    key={l}
                    onClick={() => switchLanguage(l)}
                    className="text-white hover:text-[#00FF7E] transition-colors duration-150 text-center"
                    style={{ padding: "8px 16px", fontFamily: "var(--font-inter)", fontSize: "0.9375rem", background: "none", border: "none", cursor: "pointer" }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="flex text-white hover:text-[#00FF7E] transition-colors duration-200"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            style={{ padding: 0, lineHeight: 0, background: "none", border: "none" }}
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
      {open && (
        <motion.div
          className="lg:hidden fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: "#141127" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <div className="page-px flex items-center justify-between h-[80px] shrink-0">
            <Link href="/" onClick={() => setOpen(false)} className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/astgse_Logo_Web_White.svg" alt="AST GSE" width={91} height={27} className="block" />
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-white hover:text-[#00FF7E] transition-colors duration-200" style={{ padding: 0, lineHeight: 0, display: "flex", background: "none", border: "none" }}>
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="page-px flex flex-col flex-1 overflow-y-auto pt-[40px] pb-[40px]">
            <ul className="flex flex-col text-white" style={{ fontFamily: "var(--font-inter)", gap: 24, fontSize: "1.125rem" }}>
              <li>
                <Link href="/services/maintenance-and-diagnostics" className="flex items-center group transition-colors duration-200" style={{ gap: 12 }} onClick={() => setOpen(false)}>
                  Services
                  <Chevron />
                </Link>
              </li>
              <li>
                <Link href="/equipment" className="flex items-center group transition-colors duration-200" style={{ gap: 12 }} onClick={() => setOpen(false)}>
                  Equipment
                  <Chevron />
                </Link>
              </li>
              <li><Link href="/about" className="transition-colors duration-200" onClick={() => setOpen(false)}>About</Link></li>
              <li><Link href="/careers" className="transition-colors duration-200" onClick={() => setOpen(false)}>Careers</Link></li>
              <li><Link href="/newsroom" className="transition-colors duration-200" onClick={() => setOpen(false)}>Newsroom</Link></li>
            </ul>

            <div style={{ marginTop: 48 }}>
              <Link
                href=""
                className="inline-flex items-center rounded-full text-white text-[0.9375rem] hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300 ease-out"
                style={{ fontFamily: "var(--font-inter)", padding: "8px 8px 8px 20px", gap: "12px", border: "1px solid #00FF7E", borderRadius: "100px" }}
                onClick={() => setOpen(false)}
              >
                Contact us
                <span className="flex items-center justify-center rounded-full bg-[#00FF7E]" style={{ width: 30, height: 30 }}>
                  <ArrowRight size={14} color="#141127" strokeWidth={2.5} />
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
