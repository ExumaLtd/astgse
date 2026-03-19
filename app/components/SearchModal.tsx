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
        <>
          {/* Backdrop — blur + semi-transparent, same as hero overlay */}
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: "rgba(20,17,39,0.5)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center px-[20px] md:px-[32px]"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div
              style={{
                backgroundColor: "rgba(20,17,39,0.8)",
                borderRadius: 16,
                width: "100%",
                maxWidth: 720,
                height: 720,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Header row — close */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  padding: "0 32px",
                  height: 56,
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={onClose}
                  className="text-white hover:text-[#00FF7E] transition-colors duration-200"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0 }}
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Search */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "0 32px 32px" }}>
                <Command shouldFilter={false}>
                  {/* Input row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Search size={16} strokeWidth={1.5} color="white" style={{ flexShrink: 0 }} />
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
                        fontSize: "1rem",
                        fontFamily: "var(--font-inter)",
                        padding: 0,
                      }}
                    />
                  </div>

                  {/* Results */}
                  <Command.List style={{ flex: 1, overflowY: "auto", marginTop: query.trim() ? 32 : 0 }}>
                    {loading && query.trim() && (
                      <Command.Loading>
                        <p style={{ color: "white", fontSize: "1rem", fontFamily: "var(--font-inter)", margin: 0 }}>Searching…</p>
                      </Command.Loading>
                    )}

                    {!loading && query.trim() && results.length === 0 && (
                      <Command.Empty>
                        <p style={{ color: "white", fontSize: "1rem", fontFamily: "var(--font-inter)", margin: 0 }}>
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
