"use client";

import { useState, useEffect } from "react";
import { type LC, LANG_TO_LOCALE, LANG_STORAGE_KEY, LANG_CHANGE_EVENT } from "@/app/i18n/config";

function readStoredLang(): LC {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && stored in LANG_TO_LOCALE) return stored as LC;
  } catch {
    // localStorage unavailable (private browsing, etc.)
  }
  return "EN";
}

export function useLang(): LC {
  const [lang, setLang] = useState<LC>(readStoredLang);
  useEffect(() => {
    const h = (e: Event) => setLang((e as CustomEvent<LC>).detail);
    window.addEventListener(LANG_CHANGE_EVENT, h);
    return () => window.removeEventListener(LANG_CHANGE_EVENT, h);
  }, []);
  return lang;
}
