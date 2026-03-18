"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between w-full relative z-50 px-[20px] md:px-[32px] lg:px-[40px] h-[80px]">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/astgse_Logo_Web_White.svg" alt="AST GSE" width={91} height={27} className="block" />
        </Link>

        {/* Desktop nav — hidden below lg */}
        <div className="hidden lg:flex items-center" style={{ gap: 40 }}>
          <ul className="flex items-center text-white text-[0.9375rem]" style={{ fontFamily: "var(--font-inter)", gap: "40px" }}>
            <li>
              <Link href="/services/maintenance-and-diagnostics" className="flex items-center group text-white hover:text-[#00FF7E] transition-colors duration-200" style={{ gap: "12px" }}>
                Services
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none" className="transition-transform duration-200 group-hover:rotate-180">
                  <path d="M0.75 0.75L4.75 4.75L8.75 0.75" stroke="#00FF7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </li>
            <li>
              <button className="flex items-center group text-white hover:text-[#00FF7E] transition-colors duration-200" style={{ gap: "12px" }}>
                Equipment
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none" className="transition-transform duration-200 group-hover:rotate-180">
                  <path d="M0.75 0.75L4.75 4.75L8.75 0.75" stroke="#00FF7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </li>
            <li>
              <Link href="/about" className="text-white hover:text-[#00FF7E] transition-colors duration-200">About</Link>
            </li>
            <li>
              <Link href="/careers" className="text-white hover:text-[#00FF7E] transition-colors duration-200">Careers</Link>
            </li>
            <li>
              <Link href="/newsroom" className="text-white hover:text-[#00FF7E] transition-colors duration-200">Newsroom</Link>
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
          </div>
        </div>

        {/* Burger — visible below lg */}
        <button
          className="flex lg:hidden text-white hover:text-[#00FF7E] transition-colors duration-200"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          style={{ padding: 0, lineHeight: 0, background: "none", border: "none" }}
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: "#141127" }}
        >
          {/* Header row — mirrors nav */}
          <div className="flex items-center justify-between px-[20px] md:px-[32px] py-[20px] shrink-0">
            <Link href="/" onClick={() => setOpen(false)} className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/astgse_Logo_Web_White.svg" alt="AST GSE" width={91} height={27} className="block" />
            </Link>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="text-white hover:text-[#00FF7E] transition-colors duration-200"
              style={{ padding: 0, lineHeight: 0, display: "flex", background: "none", border: "none" }}
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Nav content */}
          <div className="flex flex-col flex-1 overflow-y-auto px-[20px] md:px-[32px] pt-[40px] pb-[40px]">
            <ul className="flex flex-col text-white" style={{ fontFamily: "var(--font-inter)", gap: 32, fontSize: "1.125rem" }}>
              <li>
                <Link href="/services/maintenance-and-diagnostics" className="hover:text-[#00FF7E] transition-colors duration-200" onClick={() => setOpen(false)}>
                  Services
                </Link>
              </li>
              <li>
                <span className="text-white/60">Equipment</span>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#00FF7E] transition-colors duration-200" onClick={() => setOpen(false)}>About</Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[#00FF7E] transition-colors duration-200" onClick={() => setOpen(false)}>Careers</Link>
              </li>
              <li>
                <Link href="/newsroom" className="hover:text-[#00FF7E] transition-colors duration-200" onClick={() => setOpen(false)}>Newsroom</Link>
              </li>
            </ul>

            <div style={{ marginTop: 48 }}>
              <Link
                href=""
                className="inline-flex items-center rounded-full text-white text-[0.9375rem] hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300 ease-out"
                style={{ fontFamily: "var(--font-inter)", padding: "6px 6px 6px 20px", gap: "12px", border: "1px solid #00FF7E", borderRadius: "100px" }}
                onClick={() => setOpen(false)}
              >
                Contact us
                <span className="flex items-center justify-center rounded-full bg-[#00FF7E]" style={{ width: 26, height: 26 }}>
                  <ArrowRight size={13} color="#141127" strokeWidth={2.5} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
