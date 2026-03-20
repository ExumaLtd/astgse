export const TYPE_LABELS: Record<string, string> = {
  servicePage: "Services",
  listing: "Equipment",
  post: "News",
};

export const TYPE_HREFS: Record<string, string> = {
  servicePage: "/services",
  listing: "/equipment",
  post: "/newsroom",
};

// Types that have built individual detail pages — add to this set as pages are built
export const TYPES_WITH_DETAIL_PAGES = new Set(["servicePage"]);

export const SUGGESTIONS = [
  { en: "Maintenance", ar: "الصيانة",  es: "Mantenimiento", fr: "Maintenance", href: "/services/maintenance-and-diagnostics" },
  { en: "Brokerage",   ar: "السمسرة",  es: "Corretaje",     fr: "Courtage",    href: null },
  { en: "For sale",    ar: "للبيع",    es: "En venta",      fr: "À vendre",    href: null },
  { en: "For hire",    ar: "للإيجار",  es: "Para alquilar", fr: "À louer",     href: null },
];

export const SEARCH_UI: Record<string, Record<string, string>> = {
  en: {
    searching: "I'm searching for",
    placeholder: "e.g. Diagnostics",
    suggestions: "Or explore our suggestions",
    loading: "Searching…",
    noResults: "No results for",
  },
  ar: {
    searching: "أبحث عن",
    placeholder: "مثال: التشخيص",
    suggestions: "أو استكشف اقتراحاتنا",
    loading: "جارٍ البحث…",
    noResults: "لا توجد نتائج لـ",
  },
  es: {
    searching: "Estoy buscando",
    placeholder: "ej. Diagnósticos",
    suggestions: "O explora nuestras sugerencias",
    loading: "Buscando…",
    noResults: "Sin resultados para",
  },
  fr: {
    searching: "Je recherche",
    placeholder: "ex. Diagnostics",
    suggestions: "Ou explorez nos suggestions",
    loading: "Recherche…",
    noResults: "Aucun résultat pour",
  },
};
