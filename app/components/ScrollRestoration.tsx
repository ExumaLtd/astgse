"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Next.js App Router sets history.scrollRestoration = 'manual' and its router
// resets scroll to 0 during initialisation — after useLayoutEffect runs.
// We defer restoration with setTimeout(0) so it runs after all router effects,
// then double-check with a rAF to catch any final resets.
export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    let rafId: number;
    const timerId = setTimeout(() => {
      try {
        const saved = sessionStorage.getItem(`sp:${pathname}`);
        if (saved !== null) {
          const y = parseInt(saved, 10);
          sessionStorage.removeItem(`sp:${pathname}`);
          window.scrollTo(0, y);
          // One rAF to catch any scroll reset that fires after setTimeout
          rafId = requestAnimationFrame(() => window.scrollTo(0, y));
        }
      } catch {}
    }, 0);
    return () => {
      clearTimeout(timerId);
      cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  // Save scroll position before the page unloads
  useEffect(() => {
    const save = () => {
      try {
        sessionStorage.setItem(`sp:${pathname}`, String(window.scrollY));
      } catch {}
    };
    window.addEventListener("beforeunload", save);
    window.addEventListener("pagehide", save); // covers bfcache / Safari
    return () => {
      window.removeEventListener("beforeunload", save);
      window.removeEventListener("pagehide", save);
    };
  }, [pathname]);

  return null;
}
