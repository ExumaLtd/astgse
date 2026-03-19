"use client";

import { useState, useEffect } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
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

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await client.fetch(
          `*[_type in ["servicePage", "listing", "newsroom"] && title match $q] {
            _type,
            title,
            "slug": slug.current,
            excerpt
          }[0...20]`,
          { q: `${query}*` }
        );
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  function navigate(result: Result) {
    router.push(`${TYPE_HREFS[result._type]}/${result.slug}`);
    onClose();
  }

  const grouped = Object.entries(TYPE_LABELS).map(([type, label]) => ({
    type,
    label,
    items: results.filter((r) => r._type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: "#141127" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-6 right-[40px] text-white hover:text-[#00FF7E] transition-colors duration-200"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0 }}
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          {/* Centred search container */}
          <div className="w-full px-[20px] md:px-[32px] lg:px-0" style={{ maxWidth: 800 }}>
            <Command shouldFilter={false}>

              {/* Input row */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Search size={20} strokeWidth={1.5} color="white" style={{ flexShrink: 0 }} />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search ASTGSE"
                  autoFocus
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: "white",
                    fontSize: 18,
                    fontFamily: "var(--font-inter)",
                    padding: 0,
                  }}
                />
              </div>

              {/* Divider — only when typing */}
              {query.trim() && (
                <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.12)", margin: "24px 0" }} />
              )}

              {/* Results */}
              <Command.List>
                {loading && query.trim() && (
                  <Command.Loading>
                    <p style={{ color: "white", fontSize: 18, fontFamily: "var(--font-inter)", margin: 0 }}>Searching…</p>
                  </Command.Loading>
                )}

                {!loading && query.trim() && results.length === 0 && (
                  <Command.Empty>
                    <p style={{ color: "white", fontSize: 18, fontFamily: "var(--font-inter)", margin: 0 }}>
                      No results for &ldquo;{query}&rdquo;
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
                        className="search-item"
                      >
                        <span className="search-item-title">{r.title}</span>
                        {r.excerpt && <span className="search-item-excerpt">{r.excerpt}</span>}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>

            </Command>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
