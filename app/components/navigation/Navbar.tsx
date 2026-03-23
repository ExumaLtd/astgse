"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Menu, X, Search } from "lucide-react";
import { translatePage } from "@/app/utils/translate";
import SearchModal from "@/app/components/navigation/SearchModal";
import LanguageSwitcher from "./LanguageSwitcher";

const LANGUAGES = [
  { code: "AR", locale: "ar" },
  { code: "EN", locale: "en" },
  { code: "ES", locale: "es" },
  { code: "FR", locale: "fr" },
];

type LangCode = "en" | "ar" | "es" | "fr";

const NAV_UI: Record<LangCode, { services: string; equipment: string; about: string; careers: string; newsroom: string; contact: string }> = {
  en: { services: "Services", equipment: "Equipment", about: "About", careers: "Careers", newsroom: "Newsroom", contact: "Contact us" },
  ar: { services: "الخدمات", equipment: "المعدات", about: "عن الشركة", careers: "وظائف", newsroom: "الأخبار", contact: "اتصل بنا" },
  es: { services: "Servicios", equipment: "Equipamiento", about: "Acerca de", careers: "Empleos", newsroom: "Noticias", contact: "Contáctenos" },
  fr: { services: "Services", equipment: "Équipements", about: "À propos", careers: "Carrières", newsroom: "Actualités", contact: "Nous contacter" },
};

const Chevron = ({ open }: { open?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none"
    className="transition-transform duration-200"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <path d="M0.75 0.75L4.75 4.75L8.75 0.75" stroke="#00FF7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lang, setLang] = useState("EN");
  const locale = (lang.toLowerCase()) as LangCode;
  const t = NAV_UI[locale] ?? NAV_UI.en;
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("astgse-lang");
    const match = LANGUAGES.find((l) => l.code === stored);
    if (match && match.code !== "EN") {
      setLang(match.code);
      translatePage(match.locale);
    }
  }, []);

  function switchLanguage(code: string) {
    const match = LANGUAGES.find((l) => l.code === code);
    if (!match) return;
    setLang(code);
    localStorage.setItem("astgse-lang", code);
    translatePage(match.locale);
    window.dispatchEvent(new CustomEvent("astgse:lang-change", { detail: code }));
  }

  return (
    <>
      <nav className="navbar px-[20px] md:px-[32px] lg:px-[40px] flex items-center justify-between w-full relative z-50 h-[80px]" translate="no">
        {/* Logo */}
        <Link href="/" className="navbar__logo shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/astgse_Logo_Web_White.svg" alt="AST GSE" width={91} height={27} className="block" />
        </Link>

        {/* Desktop nav */}
        <div className="navbar__desktop hidden lg:flex items-center" style={{ gap: 40 }}>
          <ul className="navbar__links flex items-center text-white text-[0.9375rem]" style={{ fontFamily: "var(--font-inter)", gap: "40px" }}>
            <li>
              <Link href="/services/maintenance-and-diagnostics" className="navbar__link flex items-center group text-white hover:text-[#00FF7E] transition-colors duration-200" style={{ gap: "12px" }} onMouseEnter={() => setHoveredNav("services")} onMouseLeave={() => setHoveredNav(null)}>
                {t.services}
                <Chevron open={hoveredNav === "services"} />
              </Link>
            </li>
            <li>
              <button className="navbar__link flex items-center group text-white hover:text-[#00FF7E] transition-colors duration-200" style={{ gap: "12px", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-inter)", fontSize: "0.9375rem" }} onMouseEnter={() => setHoveredNav("equipment")} onMouseLeave={() => setHoveredNav(null)}>
                {t.equipment}
                <Chevron open={hoveredNav === "equipment"} />
              </button>
            </li>
            <li><span className="navbar__link text-white hover:text-[#00FF7E] transition-colors duration-200 cursor-pointer">{t.about}</span></li>
            <li><span className="navbar__link text-white hover:text-[#00FF7E] transition-colors duration-200 cursor-pointer">{t.careers}</span></li>
            <li><span className="navbar__link text-white hover:text-[#00FF7E] transition-colors duration-200 cursor-pointer">{t.newsroom}</span></li>
          </ul>

          <div className="navbar__actions flex items-center" style={{ gap: 28 }}>
            <Link
              href="/contact"
              className="navbar__contact-btn inline-flex items-center rounded-full text-white text-[0.9375rem] hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300 ease-out"
              style={{ fontFamily: "var(--font-inter)", paddingBlock: 6, paddingInlineStart: 20, paddingInlineEnd: 6, gap: "12px", border: "1px solid #00FF7E", borderRadius: "100px" }}
            >
              {t.contact}
              <span className="flex items-center justify-center rounded-full bg-[#00FF7E] rtl:rotate-180" style={{ width: 26, height: 26 }}>
                <ArrowRight size={13} color="#141127" strokeWidth={2.5} />
              </span>
            </Link>

            <button onClick={() => setSearchOpen(true)} className="navbar__search-btn text-white hover:text-[#00FF7E] transition-colors duration-200 cursor-pointer" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M12.75 12.75L9.85667 9.85667M11.4167 6.08333C11.4167 9.02885 9.02885 11.4167 6.08333 11.4167C3.13781 11.4167 0.75 9.02885 0.75 6.08333C0.75 3.13781 3.13781 0.75 6.08333 0.75C9.02885 0.75 11.4167 3.13781 11.4167 6.08333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <LanguageSwitcher lang={lang} onSwitch={switchLanguage} trigger="hover" dropdownAlign="left" />
          </div>
        </div>

        {/* Mobile right controls */}
        <div className="navbar__mobile flex lg:hidden items-center" style={{ gap: 20 }}>
          <LanguageSwitcher lang={lang} onSwitch={switchLanguage} trigger="click" dropdownAlign="right" />

          <button
            className="navbar__mobile-search flex text-white hover:text-[#00FF7E] transition-colors duration-200"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            style={{ padding: 0, lineHeight: 0, background: "none", border: "none" }}
          >
            <Search size={18} strokeWidth={1.5} />
          </button>

          <button
            className="navbar__burger flex text-white hover:text-[#00FF7E] transition-colors duration-200"
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
          dir={lang === "AR" ? "rtl" : "ltr"}
          translate="no"
          className="mobile-menu lg:hidden fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: "#141127" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <div className="mobile-menu__header page-px flex items-center justify-between h-[80px] shrink-0">
            <Link href="/" onClick={() => setOpen(false)} className="mobile-menu__logo shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/astgse_Logo_Web_White.svg" alt="AST GSE" width={91} height={27} className="block" />
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="mobile-menu__close text-white hover:text-[#00FF7E] transition-colors duration-200" style={{ padding: 0, lineHeight: 0, display: "flex", background: "none", border: "none" }}>
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="mobile-menu__body page-px flex flex-col flex-1 overflow-y-auto pt-[40px] pb-[40px]">
            <ul className="mobile-menu__links flex flex-col text-white" style={{ fontFamily: "var(--font-inter)", gap: 24, fontSize: "1.125rem" }}>
              <li>
                <Link href="/services/maintenance-and-diagnostics" className="mobile-menu__link flex items-center group hover:text-[#00FF7E] transition-colors duration-200" style={{ gap: 12 }} onClick={() => setOpen(false)}>
                  {t.services}
                  <Chevron />
                </Link>
              </li>
              <li>
                <Link href="/equipment" className="mobile-menu__link flex items-center group hover:text-[#00FF7E] transition-colors duration-200" style={{ gap: 12 }} onClick={() => setOpen(false)}>
                  {t.equipment}
                  <Chevron />
                </Link>
              </li>
              <li><span className="mobile-menu__link hover:text-[#00FF7E] transition-colors duration-200 cursor-pointer">{t.about}</span></li>
              <li><span className="mobile-menu__link hover:text-[#00FF7E] transition-colors duration-200 cursor-pointer">{t.careers}</span></li>
              <li><span className="mobile-menu__link hover:text-[#00FF7E] transition-colors duration-200 cursor-pointer">{t.newsroom}</span></li>
            </ul>

            <div className="mobile-menu__cta" style={{ marginTop: 48 }}>
              <Link
                href="/contact"
                className="mobile-menu__contact-btn inline-flex items-center rounded-full text-white text-[0.9375rem] hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300 ease-out"
                style={{ fontFamily: "var(--font-inter)", paddingBlock: 8, paddingInlineStart: 20, paddingInlineEnd: 8, gap: "12px", border: "1px solid #00FF7E", borderRadius: "100px" }}
                onClick={() => setOpen(false)}
              >
                {t.contact}
                <span className="flex items-center justify-center rounded-full bg-[#00FF7E] rtl:rotate-180" style={{ width: 30, height: 30 }}>
                  <ArrowRight size={14} color="#141127" strokeWidth={2.5} />
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
