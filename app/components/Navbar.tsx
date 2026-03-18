import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-10 py-6 w-full">
      {/* Logo */}
      <Link href="/" className="shrink-0">
        <Image
          src="/images/astgse_Logo_Web_White.svg"
          alt="AST GSE"
          width={120}
          height={32}
          priority
        />
      </Link>

      {/* Nav links */}
      <ul className="flex items-center gap-8 text-white/80 text-body-sm font-[var(--font-inter)]">
        <li>
          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            Services
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </li>
        <li>
          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            Equipment
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
          className="flex items-center gap-3 border border-green rounded-full pl-6 pr-2 py-2 text-white text-body-sm font-[var(--font-inter)] hover:bg-white/5 transition-colors"
        >
          Contact us
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="#141127" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>

        <button className="text-white/70 hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13.5 13.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
