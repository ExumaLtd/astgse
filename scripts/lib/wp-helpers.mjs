/**
 * Shared helpers for WordPress → Sanity migration and sync scripts.
 * Imported by migrate-from-wp.mjs and sync-from-wp.mjs.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

export const WP_BASE = "https://astgse.com/wp-json/wp/v2";

// Only allow images from the WordPress media library — prevents SSRF
const ALLOWED_IMAGE_DOMAIN = "astgse.com";

export const CATEGORY_MAP = {
  "ACU / ASU / GPU":               "ACU / ASU / GPU",
  "Aircraft Heaters":              "Aircraft Heaters",
  "Ambulift":                      "Ambulift",
  "Baggage Tractors":              "Baggage Tractors",
  "Bagged Carts":                  "Bagged Carts",
  "Belt Loaders":                  "Belt Loaders",
  "Buses":                         "Buses",
  "Cars":                          "Cars",
  "Catering Trucks":               "Catering Trucks",
  "Chocks":                        "Chocks",
  "Container Transport":           "Container Transport",
  "Crash Tenders":                 "Crash Tenders",
  "Deck Loaders Cargo":            "Deck Loaders / Cargo",
  "Deicing Units":                 "Deicing Units",
  "Dollies":                       "Dollies",
  "Forklifts":                     "Forklifts",
  "Fuel Tankers":                  "Fuel Tankers",
  "Ground Support Equipment":      "Ground Support Equipment",
  "Loaders / Transporters":        "Loaders / Transporters",
  "Lorries":                       "Lorries",
  "Misc":                          "Miscellaneous",
  "Other GSE":                     "Other GSE",
  "Passenger Access":              "Passenger Access",
  "PRM Units &amp; Equipment":     "PRM Units & Equipment",
  "Sweepers &amp; Vacuum Tankers": "Sweepers & Vacuum Tankers",
  "Toilet Units":                  "Toilet Units",
  "Towbar":                        "Towbar",
  "Tugs":                          "Tugs",
  "X-ray and Screening":           "X-ray and Screening",
};

// Multi-word vehicle makes that must not be split on first space
const MULTI_WORD_MAKES = [
  "Mercedes Benz", "Mercedes-Benz", "Man Truck", "Iveco Daily", "Fuso Canter",
];

// UI/button text injected by Elementor — never include in imported text
export const STRIP_PHRASES = /\b(enquire|more information|contact us|enquire now|get a quote|request info)\b/gi;

// Spec label words that delimit key-value sections in listing content
const SPEC_LABELS = "Make|Manufacturer|Model|Year|Mileage|Operation hours|Hours of Mileage|Hours|Engine|Gearbox|Chassis|Condition|Serial number|Serial|Location|Price|Shipping|Quantity";
const SPEC_RE = new RegExp(`\\b(${SPEC_LABELS})\\b`, "i");

const UK_ENGLISH = [
  // American → British spellings
  [/\banalyze\b/gi,     "analyse"],
  [/\banalyzing\b/gi,   "analysing"],
  [/\bcenter\b/gi,      "centre"],
  [/\bcenters\b/gi,     "centres"],
  [/\bcolor\b/gi,       "colour"],
  [/\bcolors\b/gi,      "colours"],
  [/\bfavor\b/gi,       "favour"],
  [/\bfavorite\b/gi,    "favourite"],
  [/\bharbor\b/gi,      "harbour"],
  [/\bhonor\b/gi,       "honour"],
  [/\blabor\b/gi,       "labour"],
  [/\bmaximize\b/gi,    "maximise"],
  [/\bminimize\b/gi,    "minimise"],
  [/\bneighbor\b/gi,    "neighbour"],
  [/\boptimize\b/gi,    "optimise"],
  [/\borganize\b/gi,    "organise"],
  [/\brecognize\b/gi,   "recognise"],
  [/\bspecialize\b/gi,  "specialise"],
  [/\bstandardize\b/gi, "standardise"],
  [/\butilize\b/gi,     "utilise"],
  // French/German/Spanish words common in GSE listings
  [/\bcabine\b/gi,                "cabin"],
  [/\bcabines\b/gi,               "cabins"],
  [/\bautomatique\b/gi,           "automatic"],
  [/\bhydraulique\b/gi,           "hydraulic"],
  [/\bhydrauliques\b/gi,          "hydraulics"],
  [/\béquipement\b/gi,            "equipment"],
  [/\bequipement\b/gi,            "equipment"],
  [/\bvéhicule\b/gi,              "vehicle"],
  [/\bvehicule\b/gi,              "vehicle"],
  [/\bmoteur\b/gi,                "engine"],
  [/\bchassis tracteur\b/gi,      "tractor chassis"],
  [/\bpneumatique\b/gi,           "pneumatic"],
  [/\bélectrique\b/gi,            "electric"],
  [/\belectrique\b/gi,            "electric"],
  [/\bdiesel\b/gi,                "Diesel"],
  [/\bboîte automatique\b/gi,     "automatic gearbox"],
  [/\bboite automatique\b/gi,     "automatic gearbox"],
  [/\bkilomètres\b/gi,            "kilometres"],
  [/\bkilometres\b/gi,            "kilometres"],
  [/\bheures\b/gi,                "hours"],
  [/\bannée\b/gi,                 "year"],
  [/\bannee\b/gi,                 "year"],
  [/\bmarque\b/gi,                "make"],
  [/\bmodèle\b/gi,                "model"],
  [/\bmodele\b/gi,                "model"],
  // Common GSE misspellings
  [/\baircraft\s+tug\b/gi,        "aircraft tug"],
  [/\bpush\s*-?\s*back\b/gi,      "pushback"],
  [/\bde-?icing\b/gi,             "de-icing"],
  [/\bbagagge\b/gi,               "baggage"],
  [/\bbagage\b/gi,                "baggage"],
  [/\bpassanger\b/gi,             "passenger"],
  [/\bpassenger\b/gi,             "passenger"],
  [/\bmaintanence\b/gi,           "maintenance"],
  [/\bmaintainance\b/gi,          "maintenance"],
  [/\bairfield\b/gi,              "airfield"],
  [/\bhydrallic\b/gi,             "hydraulic"],
  [/\bhydralic\b/gi,              "hydraulic"],
  [/\btransmision\b/gi,           "transmission"],
  [/\bengione\b/gi,               "engine"],
  [/\bengien\b/gi,                "engine"],
];

// ─── Text helpers ─────────────────────────────────────────────────────────────

/** Normalise brand names and apply UK English corrections throughout a string */
export function normaliseText(text) {
  let t = text.replace(/\bMercedes(?:\s*-?\s*Benz)?\b/g, "Mercedes-Benz");
  t = t.replace(/\blpg\b/gi, "LPG");
  for (const [pattern, replacement] of UK_ENGLISH) t = t.replace(pattern, replacement);
  return t;
}

/** Alias used in places that specifically want brand normalisation */
export const normaliseBrands = normaliseText;

/** Strip HTML tags and decode common entities */
export function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/\s+/g, " ")
    .trim();
}

/** Convert a WordPress slug to a Sanity-safe slug */
export function toSanitySlug(wpSlug) {
  return wpSlug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}

/** Generate a short random key for Sanity array items */
export function randomKey() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Spec parsing ─────────────────────────────────────────────────────────────

/**
 * Extract a labelled value from spec text.
 * e.g. extractField("Make: Rosenbauer Year: 2019", "Make") → "Rosenbauer"
 */
export function extractField(text, ...labels) {
  for (const label of labels) {
    const re = new RegExp(
      `\\b${label}[:\\s]+([^\\n\\r]+?)(?=\\s*\\b(?:${SPEC_LABELS})\\b|$)`,
      "i"
    );
    const m = text.match(re);
    if (m) {
      const val = m[1].replace(STRIP_PHRASES, "").trim();
      return val || null;
    }
  }
  return null;
}

/**
 * Parse a WordPress post and extract all structured listing fields.
 * Handles two listing types:
 *   Type A — specs as key-value pairs in excerpt (Make: X, Year: Y)
 *   Type B — specs embedded in Elementor content blocks (Chassis: X, Engine: Y)
 */
export function parseSpecs(post, debug = false) {
  const content = stripHtml(post.content?.rendered || "");
  const excerpt = stripHtml(post.excerpt?.rendered || "");
  const full = `${content} ${excerpt}`;

  // Prefer excerpt for Type A, content for Type B
  const specs = /\b(?:Make|Chassis)\b/i.test(excerpt) ? excerpt : content;

  if (debug) {
    console.log("\n── CONTENT ───────────────────────────────────");
    console.log(content);
    console.log("── EXCERPT ───────────────────────────────────");
    console.log(excerpt);
    console.log("──────────────────────────────────────────────\n");
  }

  // Make / Model
  let make  = extractField(specs, "Make", "Manufacturer");
  let model = extractField(specs, "Model");

  // Type B fallback: "Chassis: Mercedes-Benz Fuso 3s13" → make=Mercedes-Benz, model=Fuso 3s13
  if (!make) {
    const chassisVal = extractField(specs, "Chassis");
    if (chassisVal) {
      const clean = chassisVal.replace(/[\s•.,]+$/, "").trim();
      const matchedMake = MULTI_WORD_MAKES.find((m) => clean.toLowerCase().startsWith(m.toLowerCase()));
      if (matchedMake) {
        make  = matchedMake;
        model = clean.slice(matchedMake.length).replace(/^\s+/, "").replace(/[\s•.,]+$/, "") || null;
      } else {
        const parts = clean.split(/\s+/);
        make  = parts[0] || null;
        model = parts.slice(1).join(" ").replace(/[\s•.,]+$/, "") || null;
      }
    }
  }

  const yearStr  = extractField(specs, "Year");
  const year     = yearStr ? parseInt(yearStr, 10) || null : null;

  const mileageStr    = extractField(specs, "Mileage");
  const mileageAmount = mileageStr ? parseInt(mileageStr.replace(/[^\d]/g, ""), 10) || null : null;
  const mileageUnit   = mileageStr && /\bmiles?\b/i.test(mileageStr) ? "miles" : "km";
  const mileage       = mileageAmount ? { amount: mileageAmount, unit: mileageUnit } : null;

  const hoursStr = extractField(specs, "Operation hours", "Hours of Mileage", "Hours");
  const hours    = hoursStr ? parseInt(hoursStr.replace(/[^\d]/g, ""), 10) || null : null;

  // Location: labelled field, or detect "located in X" / "based in X" / "direct from X"
  // No i flag — [A-Z] must be uppercase to avoid matching mid-sentence lowercase phrases
  let location = extractField(specs, "Location");
  if (!location) {
    const locMatch = full.match(/(?:direct from|located in|based in)\s+([A-Z][A-Za-z\s,]+?)(?:\s+airport|\s+airfield|[,.]|$)/);
    if (locMatch) location = locMatch[1].trim();
  }

  const serialNumber = extractField(specs, "Serial number", "Serial");

  // Availability date: "Available April 2025" or "Available from 04/2025"
  let availableFrom = null;
  const availMatch = full.match(/[Aa]vailable\s+(?:from\s+)?([A-Za-z]+\s+\d{4}|\d{1,2}[\/\-]\d{4})/i);
  if (availMatch) {
    const parsed = new Date(availMatch[1]);
    if (!isNaN(parsed.getTime())) {
      availableFrom = parsed.toISOString().split("T")[0]; // YYYY-MM-DD
    }
  }

  // Quantity
  let quantity = null;
  const qtyMatch = full.match(/(\d+)\s+units?\s+(?:in stock|available)/i);
  if (qtyMatch) quantity = qtyMatch[1];
  else if (/multiple units/i.test(full)) quantity = "Multiple";

  // Fuel type
  let fuelType = null;
  if      (/\bdiesel\b/i.test(full))   fuelType = "Diesel";
  else if (/\belectric\b/i.test(full)) fuelType = "Electric";
  else if (/\bpetrol\b/i.test(full))   fuelType = "Petrol";
  else if (/\bhybrid\b/i.test(full))   fuelType = "Hybrid";
  else if (/\blpg\b/i.test(full))      fuelType = "LPG";

  // Transmission
  let transmission = null;
  if      (/\bauto(?:matic)?\b/i.test(full)) transmission = "Automatic";
  else if (/\bmanual\b/i.test(full))         transmission = "Manual";

  // Price
  let price = null;
  let priceCurrency = "GBP";
  let priceOnApplication = false;
  const priceMatch = full.match(/(£|€|\$|USD|EUR|GBP|AED|SAR)\s*([\d,]+)|([\d,]+)\s*(£|€|\$|USD|EUR|GBP|AED|SAR)/i);
  if (priceMatch) {
    const symbol = (priceMatch[1] || priceMatch[4] || "").toUpperCase();
    const digits  = (priceMatch[2] || priceMatch[3] || "").replace(/,/g, "");
    price = parseInt(digits, 10) || null;
    if      (symbol === "€" || symbol === "EUR") priceCurrency = "EUR";
    else if (symbol === "$" || symbol === "USD") priceCurrency = "USD";
    else if (symbol === "AED")                   priceCurrency = "AED";
    else if (symbol === "SAR")                   priceCurrency = "SAR";
    else                                         priceCurrency = "GBP";
  } else {
    priceOnApplication = true;
  }

  // Status
  const status = [];
  if (/\bfor sale\b/i.test(full)) status.push("For Sale");
  if (/\bfor hire\b/i.test(full)) status.push("For Hire");
  if (status.length === 0) status.push("For Sale");

  // Description + Specifications
  let description = null;
  let specifications = null;

  const descMatch = content.match(/\b(?:GENERAL\s+)?DESCRIPTION\b[:\s]+(.+?)(?=\s*\b(?:WORKING RANGE|APPLICABLE REGULATIONS|STANDARD FEATURES|Enquire)\b|$)/i);
  if (descMatch) {
    description = normaliseText(descMatch[1].replace(STRIP_PHRASES, "").replace(/\s+/g, " ").trim());
  }

  if (!description) {
    const titleText = stripHtml(post.title?.rendered || "");
    const cleaned = content
      .replace(new RegExp(`^\\s*${titleText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "")
      .replace(STRIP_PHRASES, "")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned.length > 20) {
      const cutoff = cleaned.indexOf(". ", 200);
      description = normaliseText(cutoff > 0 ? cleaned.slice(0, cutoff + 1) : cleaned.slice(0, 600));
    }
  }

  const specsMatch = content.match(/\b(?:STANDARD FEATURES|TECHNICAL|SPECIFICATIONS|WORKING RANGE)\b(.+?)(?=\s*\bEnquire\b|$)/is);
  if (specsMatch) {
    specifications = normaliseText(specsMatch[1].replace(STRIP_PHRASES, "").replace(/\s+/g, " ").trim());
  }

  return {
    make:           make           ? normaliseText(make)  : null,
    model:          model          ? normaliseText(model) : null,
    description:    description    || null,
    specifications: specifications || null,
    year, mileage, hours, fuelType, transmission, quantity,
    location, availableFrom, serialNumber,
    price, priceCurrency, priceOnApplication, status,
  };
}

// ─── Image upload ─────────────────────────────────────────────────────────────

/**
 * Upload an image URL to Sanity.
 * - Enforces domain whitelist to prevent SSRF
 * - Deduplicates within a run via the uploadedAssets Map
 * - Returns a Sanity image reference object, or null on failure
 */
export async function uploadImage(url, sanityClient, uploadedAssets) {
  // SSRF guard: only fetch images from the known WordPress domain
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== ALLOWED_IMAGE_DOMAIN) {
      console.warn(`  ⚠ Blocked image from unexpected domain: ${parsed.hostname}`);
      return null;
    }
  } catch {
    console.warn(`  ⚠ Invalid image URL: ${url}`);
    return null;
  }

  if (uploadedAssets.has(url)) return uploadedAssets.get(url);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ASTGSE-Migration/1.0)" },
      signal: AbortSignal.timeout(30_000), // 30s timeout
    });
    if (!res.ok) {
      console.warn(`  ⚠ Image fetch ${res.status}: ${url}`);
      return null;
    }
    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      console.warn(`  ⚠ Non-image content-type (${contentType}): ${url}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = url.split("/").pop()?.split("?")[0] || "image.jpg";
    const asset = await sanityClient.assets.upload("image", buffer, { filename, contentType });
    const ref = { _key: randomKey(), _type: "image", asset: { _type: "reference", _ref: asset._id } };
    uploadedAssets.set(url, ref);
    return ref;
  } catch (err) {
    console.warn(`  ⚠ Failed to upload image: ${url} — ${err.message}`);
    return null;
  }
}

/**
 * Collect and upload all images for a WP post (featured + content images).
 * Filters out WordPress auto-generated thumbnail sizes (e.g. -300x225.jpg).
 */
export async function getPostImages(post, sanityClient, uploadedAssets) {
  const images = [];

  const featured = post._embedded?.["wp:featuredmedia"]?.[0];
  if (featured?.source_url) {
    const ref = await uploadImage(featured.source_url, sanityClient, uploadedAssets);
    if (ref) images.push(ref);
  }

  const contentHtml = post.content?.rendered || "";
  const imgMatches = [...contentHtml.matchAll(/https:\/\/astgse\.com\/wp-content\/uploads\/[^\s"'>]+\.(?:jpg|jpeg|png|webp)/gi)];
  const extraUrls = [...new Set(
    imgMatches.map((m) => m[0]).filter((u) => !/-\d+x\d+\.(jpg|jpeg|png|webp)$/i.test(u))
  )];

  for (const url of extraUrls) {
    if (url === featured?.source_url) continue;
    const ref = await uploadImage(url, sanityClient, uploadedAssets);
    if (ref) images.push(ref);
  }

  return images;
}

// ─── WordPress API helpers ────────────────────────────────────────────────────

/** Fetch all published posts from WordPress, paginated */
export async function fetchAllPosts() {
  const posts = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = `${WP_BASE}/posts?per_page=100&page=${page}&_embed=true&status=publish`;
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });

    if (!res.ok) {
      if (res.status === 400) break; // past last page
      throw new Error(`WP API error ${res.status} on page ${page}`);
    }

    totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
    const data = await res.json();
    posts.push(...data);
    console.log(`  Fetched page ${page}/${totalPages} (${data.length} posts)`);
    page++;
  } while (page <= totalPages);

  return posts;
}

/** Fetch all WP categories as a map: id → name */
export async function fetchCategories() {
  const res = await fetch(`${WP_BASE}/categories?per_page=100`, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`WP categories API error ${res.status}`);
  const data = await res.json();
  return Object.fromEntries(data.map((c) => [c.id, c.name]));
}

/** Build a Sanity document from a WP post + parsed specs + uploaded images */
export function buildListingDoc(post, specs, images, sanityCategory) {
  const title = normaliseBrands(stripHtml(post.title?.rendered || "Untitled"));
  const slug   = toSanitySlug(post.slug);

  const doc = {
    _type: "listing",
    title,
    slug: { _type: "slug", current: slug },
    published: true,
    category: sanityCategory,
    status: specs.status,
    make:         specs.make         || undefined,
    model:        specs.model        || undefined,
    year:         specs.year         || undefined,
    mileage:      specs.mileage      || undefined,
    hours:        specs.hours        || undefined,
    fuelType:     specs.fuelType     || undefined,
    transmission: specs.transmission || undefined,
    quantity:     specs.quantity     ?? undefined,
    salePrice: {
      amount:        specs.price        || undefined,
      currency:      specs.priceCurrency || "GBP",
      onApplication: specs.priceOnApplication,
    },
    description:    specs.description    || undefined,
    specifications: specs.specifications || undefined,
    images:         images.length > 0 ? images : undefined,
    location:       specs.location    || undefined,
    availableFrom:  specs.availableFrom || undefined,
    serialNumber:   specs.serialNumber  || undefined,
    featured: false,
  };

  // Remove undefined fields — Sanity rejects them
  Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);
  return doc;
}
