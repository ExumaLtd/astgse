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
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: "rgba(20,17,39,0.7)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 top-[12vh] z-[101] mx-auto w-full max-w-[580px] px-[20px]"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Command
              shouldFilter={false}
              className="search-command"
            >
              <div className="search-input-row">
                <Search size={15} strokeWidth={1.5} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search services, equipment, news…"
                  className="search-input"
                  autoFocus
                />
                <button onClick={onClose} className="search-close">
                  <X size={15} strokeWidth={1.5} />
                </button>
              </div>

              <Command.List className="search-list">
                {loading && (
                  <Command.Loading>
                    <div className="search-empty">Searching…</div>
                  </Command.Loading>
                )}

                {!loading && query.trim() && results.length === 0 && (
                  <Command.Empty>
                    <div className="search-empty">No results for &ldquo;{query}&rdquo;</div>
                  </Command.Empty>
                )}

                {!query.trim() && (
                  <div className="search-empty" style={{ opacity: 0.4 }}>Start typing to search</div>
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
