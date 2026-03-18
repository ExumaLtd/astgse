import Link from "next/link";
import { ChevronDown, ArrowRight, Search } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-10 py-6 w-full">
      {/* Logo */}
      <Link href="/" className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/astgse_Logo_Web_White.svg"
          alt="AST GSE"
          width={91}
          height={27}
        />
      </Link>

      {/* Nav links */}
      <ul className="flex items-center gap-8 text-white/80 text-[15px]" style={{ fontFamily: "var(--font-inter)" }}>
        <li>
          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            Services <ChevronDown size={14} />
          </button>
        </li>
        <li>
          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            Equipment <ChevronDown size={14} />
          </button>
        </li>
        <li>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
        </li>
        <li>
          <Link href="/careers" className="hover:text-white transition-colors">Careers</Link>
        </li>
        <li>
          <Link href="/newsroom" className="hover:text-white transition-colors">Newsroom</Link>
        </li>
      </ul>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <Link
          href="/contact"
          className="flex items-center gap-3 border border-green rounded-full pl-5 pr-1.5 py-1.5 text-white text-[15px] hover:bg-white/5 transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Contact us
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green">
            <ArrowRight size={16} color="#141127" />
          </span>
        </Link>

        <button className="text-white/70 hover:text-white transition-colors">
          <Search size={18} />
        </button>
      </div>
    </nav>
  );
}
