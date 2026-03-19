"use client";

import React, { useState, useEffect } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { client } from "@/sanity/client";

type Result = {
  _type: string;
  title: string;
  slug: string;
  excerpt?: string;
};

const TYPE_LABELS: Record<string, string> = {
  servicePage: "Services",
  listing: "Equipment",
  newsroom: "News",
};

const TYPE_HREFS: Record<string, string> = {
  servicePage: "/services",
  listing: "/equipment",
  newsroom: "/newsroom",
};

const SUGGESTIONS = [
  { en: "Maintenance", ar: "الصيانة",  es: "Mantenimiento", fr: "Maintenance", href: "/services/maintenance-and-diagnostics" },
  { en: "Brokerage",   ar: "السمسرة",  es: "Corretaje",     fr: "Courtage",    href: null },
  { en: "For sale",    ar: "للبيع",    es: "En venta",      fr: "À vendre",    href: null },
  { en: "For hire",    ar: "للإيجار",  es: "Para alquilar", fr: "À louer",     href: null },
];

const UI: Record<string, Record<string, string>> = {
  en: {
    searching: "I'm searching for",
    placeholder: "e.g. Maintenance support",
    suggestions: "Or explore our suggestions",
    loading: "Searching…",
    noResults: "No results for",
  },
  ar: {
    searching: "أبحث عن",
    placeholder: "مثال: دعم الصيانة",
    suggestions: "أو استكشف اقتراحاتنا",
    loading: "جارٍ البحث…",
    noResults: "لا توجد نتائج لـ",
  },
  es: {
    searching: "Estoy buscando",
    placeholder: "ej. Soporte de mantenimiento",
    suggestions: "O explora nuestras sugerencias",
    loading: "Buscando…",
    noResults: "Sin resultados para",
  },
  fr: {
    searching: "Je recherche",
    placeholder: "ex. Support de maintenance",
    suggestions: "Ou explorez nos suggestions",
    loading: "Recherche…",
    noResults: "Aucun résultat pour",
  },
};

function fuzzyMatch(text: string, q: string): boolean {
  const t = text.toLowerCase();
  const query = q.toLowerCase().trim();
  if (t.includes(query)) return true;
  // Allow 1 typo per 4 characters (Levenshtein-lite via sliding window)
  const words = query.split(/\s+/);
  return words.every((word) => {
    if (t.includes(word)) return true;
    if (word.length < 3) return t.includes(word);
    const allowed = Math.floor(word.length / 4) + 1;
    for (let i = 0; i <= t.length - word.length + allowed; i++) {
      const slice = t.slice(i, i + word.length + allowed);
      if (levenshtein(slice.slice(0, word.length), word) <= allowed) return true;
    }
    return false;
  });
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [allDocs, setAllDocs] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [locale, setLocale] = useState("en");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("astgse-lang")?.toLowerCase() || "en";
    setLocale(UI[stored] ? stored : "en");
  }, [open]);

  const t = UI[locale] || UI.en;

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      return;
    }
    // Fetch all docs once when modal opens
    client.fetch(
      `*[_type in ["servicePage", "listing", "newsroom"]] {
        _type,
        title,
        "slug": slug.current,
        excerpt
      }`
    ).then(setAllDocs).catch(() => setAllDocs([]));
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      let searchQuery = query.trim();
      // If the page is in a non-English language, translate the query to English first
      const lang = document.documentElement.getAttribute("lang");
      if (lang && lang !== "en") {
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang}&tl=en&dt=t&q=${encodeURIComponent(searchQuery)}`;
          const res = await fetch(url);
          const data = await res.json();
          searchQuery = data[0]?.map((item: [string]) => item[0]).join("") || searchQuery;
        } catch {
          // fall back to original query
        }
      }
      const filtered = allDocs.filter((r) => fuzzyMatch(r.title, searchQuery));
      setResults(filtered.slice(0, 20));
      setLoading(false);
    }, 150);
    return () => clearTimeout(timeout);
  }, [query, allDocs]);

  function navigate(result: Result) {
    router.push(`${TYPE_HREFS[result._type]}/${result.slug}`);
    onClose();
  }

  function handleSuggestion(s: string) {
    setQuery(s);
  }

  function highlight(text: string, q: string) {
    if (!q.trim()) return <>{text}</>;
    const lower = text.toLowerCase();
    const words = q.trim().split(/\s+/);
    const ranges: [number, number][] = [];

    for (const word of words) {
      const w = word.toLowerCase();
      if (!w) continue;
      const allowed = Math.floor(w.length / 4) + 1;

      // Exact match first
      const exactIdx = lower.indexOf(w);
      if (exactIdx >= 0) {
        ranges.push([exactIdx, exactIdx + w.length]);
        continue;
      }

      // Fuzzy: slide a window and find the closest substring
      let bestDist = Infinity;
      let bestStart = -1;
      let bestLen = w.length;
      for (let len = Math.max(1, w.length - 1); len <= w.length + 1; len++) {
        for (let i = 0; i <= lower.length - len; i++) {
          const dist = levenshtein(lower.slice(i, i + len), w);
          if (dist < bestDist) { bestDist = dist; bestStart = i; bestLen = len; }
        }
      }
      if (bestDist <= allowed && bestStart >= 0) {
        ranges.push([bestStart, bestStart + bestLen]);
      }
    }

    if (ranges.length === 0) return <>{text}</>;

    // Sort + merge overlapping ranges
    ranges.sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [];
    for (const [s, e] of ranges) {
      if (merged.length && s <= merged[merged.length - 1][1]) {
        merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
      } else {
        merged.push([s, e]);
      }
    }

    const parts: React.ReactNode[] = [];
    let last = 0;
    for (const [s, e] of merged) {
      if (s > last) parts.push(text.slice(last, s));
      parts.push(<mark key={s} style={{ backgroundColor: "#00FF7E", color: "#141127", borderRadius: 2, padding: "0 2px" }}>{text.slice(s, e)}</mark>);
      last = e;
    }
    if (last < text.length) parts.push(text.slice(last));
    return <>{parts}</>;
  }

  const grouped = Object.entries(TYPE_LABELS).map(([type, label]) => ({
    type,
    label,
    items: results.filter((r) => r._type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Full-screen white overlay */}
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col"
            dir={locale === "ar" ? "rtl" : "ltr"}
            style={{ backgroundColor: "#ffffff" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Close — mirrors navbar height + padding */}
            <div className="px-[20px] md:px-[32px] lg:px-[40px] flex items-center justify-between h-[80px] shrink-0">
              <Link href="/" onClick={onClose} className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/astgse_Logo_Web_White.svg"
                  alt="AST GSE"
                  width={91}
                  height={27}
                  style={{ filter: "brightness(0) saturate(100%) invert(8%) sepia(38%) saturate(850%) hue-rotate(224deg) brightness(90%) contrast(105%)" }}
                />
              </Link>
              <button
                onClick={onClose}
                className="text-[#141127] hover:text-[#00FF7E] transition-colors duration-200"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0 }}
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 items-center justify-center px-[20px] md:px-[32px] pb-[80px]">
            <div
              className="w-full"
              style={{ maxWidth: 720 }}
            >

              <Command shouldFilter={false} className="search-modal-light">
                {/* Label */}
                <p style={{
                  color: "#141127",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-inter)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  margin: "0 0 20px",
                }}>
                  {t.searching}
                </p>

                {/* Large input + underline */}
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder={t.placeholder}
                  autoFocus
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    borderBottom: "0.5px solid #141127",
                    outline: "none",
                    color: "#141127",
                    fontSize: "2rem",
                    fontFamily: "var(--font-almaren-nueva)",
                    fontWeight: 21,
                    padding: "0 0 16px",
                    display: "block",
                  }}
                />

                {/* Results */}
                <Command.List style={{ marginTop: query.trim() ? 24 : 0 }}>
                  {loading && query.trim() && (
                    <Command.Loading>
                      <p style={{ color: "#141127", fontSize: "1rem", fontFamily: "var(--font-inter)", margin: 0 }}>{t.loading}</p>
                    </Command.Loading>
                  )}

                  {!loading && query.trim() && results.length === 0 && (
                    <Command.Empty>
                      <p style={{ color: "#141127", fontSize: "1rem", fontFamily: "var(--font-inter)", margin: 0 }}>
                        {t.noResults} &ldquo;{query}&rdquo;
                      </p>
                    </Command.Empty>
                  )}

                  {grouped.map(({ type, label, items }) => (
                    <Command.Group key={type} heading={label}>
                      {items.map((r) => (
                        <Command.Item
                          key={r.slug}
                          value={`${type}-${r.slug}`}
                          onSelect={() => navigate(r)}
                          className="search-item-light"
                        >
                          <span className="search-item-title-light">{highlight(r.title, query)}</span>
                          {r.excerpt && <span className="search-item-excerpt-light">{r.excerpt}</span>}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
                </Command.List>

                {/* Suggestions — always visible */}
                <div style={{ marginTop: 50 }}>
                  <p style={{
                    color: "#141127",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    fontFamily: "var(--font-inter)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: "0 0 16px",
                  }}>
                    {t.suggestions}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {SUGGESTIONS.map((s) => {
                      const label = s[locale as keyof typeof s] as string || s.en;
                      const sharedClass = "inline-flex items-center";
                      const sharedStyle = {
                        borderRadius: 100,
                        fontSize: "0.9375rem",
                        fontFamily: "var(--font-inter)",
                        paddingBlock: 8,
                        paddingInlineStart: 20,
                        paddingInlineEnd: 8,
                        gap: 12,
                        cursor: "pointer",
                        backgroundColor: "#00FF7E",
                        color: "#141127",
                        border: "none",
                        textDecoration: "none",
                      };
                      const arrow = (
                        <span
                          className="flex items-center justify-center rounded-full rtl:rotate-180"
                          style={{ width: 26, height: 26, flexShrink: 0, backgroundColor: "#141127", color: "#00FF7E" }}
                        >
                          <ArrowRight size={13} color="currentColor" strokeWidth={2.5} />
                        </span>
                      );
                      if (s.href) {
                        return (
                          <a key={s.en} href={s.href} onClick={onClose} className={sharedClass} style={sharedStyle}>
                            {label}{arrow}
                          </a>
                        );
                      }
                      return (
                        <button key={s.en} onClick={() => handleSuggestion(s.en)} className={sharedClass} style={sharedStyle}>
                          {label}{arrow}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Command>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
