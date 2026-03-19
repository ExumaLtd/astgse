// Unofficial Google Translate API — same backend, no widget, no toolbar
const CACHE = new Map<string, string>();

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text.trim()) return text;
  const key = `${targetLang}:${text}`;
  if (CACHE.has(key)) return CACHE.get(key)!;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = data[0]?.map((item: [string]) => item[0]).join("") || text;
    CACHE.set(key, translated);
    return translated;
  } catch {
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
      // Skip elements marked translate="no"
      if (parent.closest("[translate='no']")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node: Text | null;
  while ((node = walker.nextNode() as Text)) nodes.push(node);
  return nodes;
}

// Store originals so we can restore them
const originals = new Map<Text, string>();

export async function translatePage(targetLang: string): Promise<void> {
  console.log("[translate] called with:", targetLang);
  const nodes = getTextNodes(document.body);
  console.log("[translate] nodes found:", nodes.length);

  if (targetLang === "en") {
    originals.forEach((original, node) => { node.textContent = original; });
    document.documentElement.removeAttribute("dir");
    document.documentElement.removeAttribute("lang");
    return;
  }

  nodes.forEach((node) => {
    if (!originals.has(node)) originals.set(node, node.textContent || "");
  });

  document.documentElement.setAttribute("dir", targetLang === "ar" ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", targetLang);

  const batchSize = 10;
  for (let i = 0; i < nodes.length; i += batchSize) {
    const batch = nodes.slice(i, i + batchSize);
    await Promise.all(batch.map(async (node) => {
      const original = originals.get(node) || node.textContent || "";
      console.log("[translate] translating:", original.trim().slice(0, 40));
      node.textContent = await translateText(original, targetLang);
    }));
  }
  console.log("[translate] done");
}
