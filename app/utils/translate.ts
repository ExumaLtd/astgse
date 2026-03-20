// Unofficial Google Translate API — same backend, no widget, no toolbar

const CACHE = new Map<string, string>();
const TRANSLATE_TIMEOUT_MS = 8_000;

// Tracks the most recently requested language — any in-flight translation
// for a different language will abort mid-batch rather than overwriting.
let _activeLang = "en";

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text.trim()) return text;
  const key = `${targetLang}:${text}`;
  if (CACHE.has(key)) return CACHE.get(key)!;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(TRANSLATE_TIMEOUT_MS) });

    // Only cache on success — don't cache rate-limited or error responses
    if (!res.ok) return text;

    const data = await res.json();
    // Validate expected response shape before using it
    if (!Array.isArray(data) || !Array.isArray(data[0])) return text;

    const translated = data[0].map((item: [string]) => item[0]).join("") || text;
    CACHE.set(key, translated);
    return translated;
  } catch {
    // Network error, timeout, or parse failure — return original silently
    return text;
  }
}

function getTextNodes(root: Element): Text[] {
  const nodes: Text[] = [];
  const skip = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "SVG", "INPUT", "TEXTAREA"]);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent || skip.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[translate='no']")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node: Text | null;
  while ((node = walker.nextNode() as Text)) nodes.push(node);
  return nodes;
}

// Store originals so we can restore them on switch back to English
const originals = new Map<Text, string>();

export function translatePage(targetLang: string): void {
  // Defer to idle so the language switcher click response feels instant
  const run = () => _translatePage(targetLang);
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(run, { timeout: 1000 });
  } else {
    setTimeout(run, 0);
  }
}

async function _translatePage(targetLang: string): Promise<void> {
  // Register this as the active translation — any older in-flight run will bail
  _activeLang = targetLang;

  const nodes = getTextNodes(document.body);

  if (targetLang === "en") {
    originals.forEach((original, node) => { node.textContent = original; });
    document.documentElement.removeAttribute("dir");
    document.documentElement.setAttribute("lang", "en");
    return;
  }

  nodes.forEach((node) => {
    if (!originals.has(node)) originals.set(node, node.textContent || "");
  });

  document.documentElement.setAttribute("dir", targetLang === "ar" ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", targetLang);

  // Translate in batches of 10 to avoid overwhelming the API
  const BATCH_SIZE = 10;
  for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
    // Bail if the user switched language again while we were mid-batch
    if (_activeLang !== targetLang) return;

    const batch = nodes.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (node) => {
      const original = originals.get(node) || node.textContent || "";
      const translated = await translateText(original, targetLang);
      // Check again after the async fetch — another switch may have happened
      if (_activeLang !== targetLang) return;
      node.textContent = translated;
    }));
  }
}
