/**
 * ASTGSE WordPress → Sanity Migration Script
 *
 * Fetches all equipment listings from astgse.com WordPress REST API,
 * downloads images, uploads to Sanity, and creates listing documents.
 *
 * Prerequisites:
 *   1. Add SANITY_WRITE_TOKEN to your .env.local (get from sanity.io/manage → API → Tokens → Add token → Editor)
 *   2. Run: node scripts/migrate-from-wp.mjs
 *
 * Safe to re-run — checks for existing slugs and skips duplicates.
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

// ─── Sanity client ────────────────────────────────────────────────────────────

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "kcmbd43u",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// ─── WordPress API ────────────────────────────────────────────────────────────

const WP_BASE = "https://astgse.com/wp-json/wp/v2";

/** Fetch all posts across all pages */
async function fetchAllPosts() {
  const posts = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = `${WP_BASE}/posts?per_page=100&page=${page}&_embed=true&status=publish`;
    const res = await fetch(url);

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
async function fetchCategories() {
  const res = await fetch(`${WP_BASE}/categories?per_page=100`);
  const data = await res.json();
  return Object.fromEntries(data.map((c) => [c.id, c.name]));
}

// ─── Category mapping: WP name → Sanity value ────────────────────────────────

const CATEGORY_MAP = {
  "ACU / ASU / GPU":           "ACU / ASU / GPU",
  "Aircraft Heaters":          "Aircraft Heaters",
  "Ambulift":                  "Ambulift",
  "Baggage Tractors":          "Baggage Tractors",
  "Bagged Carts":              "Bagged Carts",
  "Belt Loaders":              "Belt Loaders",
  "Buses":                     "Buses",
  "Cars":                      "Cars",
  "Catering Trucks":           "Catering Trucks",
  "Chocks":                    "Chocks",
  "Container Transport":       "Container Transport",
  "Crash Tenders":             "Crash Tenders",
  "Deck Loaders Cargo":        "Deck Loaders / Cargo",
  "Deicing Units":             "Deicing Units",
  "Dollies":                   "Dollies",
  "Forklifts":                 "Forklifts",
  "Fuel Tankers":              "Fuel Tankers",
  "Ground Support Equipment":  "Ground Support Equipment",
  "Loaders / Transporters":    "Loaders / Transporters",
  "Lorries":                   "Lorries",
  "Misc":                      "Miscellaneous",
  "Other GSE":                 "Other GSE",
  "Passenger Access":          "Passenger Access",
  "PRM Units &amp; Equipment": "PRM Units & Equipment",
  "Sweepers &amp; Vacuum Tankers": "Sweepers & Vacuum Tankers",
  "Toilet Units":              "Toilet Units",
  "Towbar":                    "Towbar",
  "Tugs":                      "Tugs",
  "X-ray and Screening":       "X-ray and Screening",
};

// ─── Spec parsing ─────────────────────────────────────────────────────────────

/** Strip HTML tags and decode basic entities */
function stripHtml(html) {
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

// UI/button text injected by Elementor that we never want in descriptions
const STRIP_PHRASES = /\b(enquire|more information|contact us|enquire now|get a quote|request info)\b/gi;

// The spec label words that delimit sections in the stripped content
const SPEC_LABELS = "Make|Manufacturer|Model|Year|Mileage|Operation hours|Hours of Mileage|Hours|Engine|Gearbox|Chassis|Condition|Serial number|Serial|Location|Price|Shipping|Quantity";
const SPEC_RE = new RegExp(`\\b(${SPEC_LABELS})\\b`, "i");

/** Extract a labelled value from spec text, e.g. "Make: Rosenbauer" → "Rosenbauer" */
function extractField(text, ...labels) {
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

function parseSpecs(post) {
  const raw = stripHtml(post.content?.rendered || "");

  // ── Structured fields ────────────────────────────────────────────────────
  const make  = extractField(raw, "Make", "Manufacturer");
  const model = extractField(raw, "Model");

  const yearStr = extractField(raw, "Year");
  const year = yearStr ? parseInt(yearStr, 10) || null : null;

  const mileageStr = extractField(raw, "Mileage");
  const mileage = mileageStr ? parseInt(mileageStr.replace(/[^\d]/g, ""), 10) || null : null;

  const hoursStr = extractField(raw, "Operation hours", "Hours of Mileage", "Hours");
  const hours = hoursStr ? parseInt(hoursStr.replace(/[^\d]/g, ""), 10) || null : null;

  const location = extractField(raw, "Location");
  const serialNumber = extractField(raw, "Serial number", "Serial");

  // ── Quantity ─────────────────────────────────────────────────────────────
  let quantity = null;
  const qtyMatch = raw.match(/(\d+)\s+units?\s+(?:in stock|available)/i);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1], 10);
  } else if (/multiple units/i.test(raw)) {
    quantity = null; // multiple but unknown count
  }

  // ── Fuel type ────────────────────────────────────────────────────────────
  let fuelType = null;
  if (/\bdiesel\b/i.test(raw))    fuelType = "Diesel";
  else if (/\belectric\b/i.test(raw)) fuelType = "Electric";
  else if (/\bpetrol\b/i.test(raw))   fuelType = "Petrol";
  else if (/\bhybrid\b/i.test(raw))   fuelType = "Hybrid";
  else if (/\blpg\b/i.test(raw))      fuelType = "LPG";

  // ── Transmission ─────────────────────────────────────────────────────────
  let transmission = null;
  if (/\bauto(?:matic)?\b/i.test(raw))  transmission = "Automatic";
  else if (/\bmanual\b/i.test(raw))     transmission = "Manual";

  // ── Price ────────────────────────────────────────────────────────────────
  let price = null;
  let priceOnApplication = false;
  const priceMatch = raw.match(/£\s*([\d,]+)/);
  if (priceMatch) {
    price = parseInt(priceMatch[1].replace(/,/g, ""), 10) || null;
  } else {
    priceOnApplication = true;
  }

  // ── Status ───────────────────────────────────────────────────────────────
  let status = "For Sale";
  if (/\bfor hire\b/i.test(raw)) status = "For Hire";

  // ── Description ──────────────────────────────────────────────────────────
  // Extract text after "Description" label, before the first spec label
  let description = null;
  const descMatch = raw.match(/\bDescription\b[:\s]+(.+?)(?=\s*\b(?:Make|Manufacturer|Model|Year|Mileage|Price|Shipping|Enquire)\b)/i);
  if (descMatch) {
    description = descMatch[1].replace(STRIP_PHRASES, "").replace(/\s+/g, " ").trim();
  }
  // Fall back to excerpt if no inline description found
  if (!description) {
    description = stripHtml(post.excerpt?.rendered || "").replace(STRIP_PHRASES, "").trim();
  }
  if (!description) description = null;

  return { make, model, year, mileage, hours, fuelType, transmission, quantity, location, serialNumber, price, priceOnApplication, status, description };
}

// ─── Image upload ─────────────────────────────────────────────────────────────

const uploadedAssets = new Map(); // url → sanity asset ref (dedup)

function randomKey() {
  return Math.random().toString(36).slice(2, 10);
}

async function uploadImage(url) {
  if (uploadedAssets.has(url)) return uploadedAssets.get(url);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ASTGSE-Migration/1.0)" },
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

    const asset = await sanity.assets.upload("image", buffer, { filename, contentType });
    const ref = { _key: randomKey(), _type: "image", asset: { _type: "reference", _ref: asset._id } };
    uploadedAssets.set(url, ref);
    return ref;
  } catch (err) {
    console.warn(`  ⚠ Failed to upload image: ${url} — ${err.message}`);
    return null;
  }
}

async function getPostImages(post) {
  const images = [];

  // Featured image
  const featured = post._embedded?.["wp:featuredmedia"]?.[0];
  if (featured?.source_url) {
    const ref = await uploadImage(featured.source_url);
    if (ref) images.push(ref);
  }

  // Additional images from content (look for wp-content/uploads URLs)
  const contentHtml = post.content?.rendered || "";
  const imgMatches = [...contentHtml.matchAll(/https:\/\/astgse\.com\/wp-content\/uploads\/[^\s"'>]+\.(?:jpg|jpeg|png|webp)/gi)];
  // Filter out WordPress auto-generated thumbnail sizes (e.g. -300x225.jpg)
  const extraUrls = [...new Set(
    imgMatches.map((m) => m[0]).filter((u) => !/-\d+x\d+\.(jpg|jpeg|png|webp)$/i.test(u))
  )];

  for (const url of extraUrls) {
    // Skip if already added as featured
    const featured_url = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    if (url === featured_url) continue;
    const ref = await uploadImage(url);
    if (ref) images.push(ref);
  }

  return images;
}

// ─── Slug helpers ─────────────────────────────────────────────────────────────

function toSanitySlug(wpSlug) {
  return wpSlug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}

async function slugExists(slug) {
  const result = await sanity.fetch(`*[_type == "listing" && slug.current == $slug][0]._id`, { slug });
  return !!result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.SANITY_WRITE_TOKEN) {
    console.error("\n❌ SANITY_WRITE_TOKEN is not set.");
    console.error("   1. Go to https://www.sanity.io/manage → your project → API → Tokens");
    console.error("   2. Create a new token with Editor permissions");
    console.error("   3. Add SANITY_WRITE_TOKEN=your_token to .env.local\n");
    process.exit(1);
  }

  console.log("🚀 Starting migration from astgse.com WordPress → Sanity\n");

  console.log("📋 Fetching categories...");
  const categories = await fetchCategories();

  console.log("📦 Fetching all posts...");
  const allPosts = await fetchAllPosts();
  const posts = allPosts.slice(0, 1); // TEST: import 1 only
  console.log(`\n✅ Found ${posts.length} posts total\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const slug = toSanitySlug(post.slug);
    const title = stripHtml(post.title?.rendered || "Untitled");

    process.stdout.write(`[${i + 1}/${posts.length}] ${title.slice(0, 60)}... `);

    // Skip duplicates
    if (await slugExists(slug)) {
      console.log("⏭ skipped (already exists)");
      skipped++;
      continue;
    }

    try {
      // Category
      const wpCategoryIds = post.categories || [];
      const wpCategoryNames = wpCategoryIds.map((id) => categories[id]).filter(Boolean);
      const sanityCategory = wpCategoryNames
        .map((n) => CATEGORY_MAP[n] || CATEGORY_MAP[n.replace(/&amp;/g, "&")])
        .find(Boolean) || "Other GSE";

      // Specs
      const specs = parseSpecs(post);

      // Images
      const images = await getPostImages(post);

      // Build document
      const doc = {
        _type: "listing",
        title,
        slug: { _type: "slug", current: slug },
        category: sanityCategory,
        status: specs.status,
        make: specs.make || undefined,
        model: specs.model || undefined,
        year: specs.year || undefined,
        mileage: specs.mileage || undefined,
        hours: specs.hours || undefined,
        fuelType: specs.fuelType || undefined,
        transmission: specs.transmission || undefined,
        quantity: specs.quantity || undefined,
        condition: undefined,
        price: specs.price || undefined,
        priceOnApplication: specs.priceOnApplication,
        description: specs.description || undefined,
        images: images.length > 0 ? images : undefined,
        location: specs.location || undefined,
        serialNumber: specs.serialNumber || undefined,
        featured: false,
      };

      // Remove undefined fields
      Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);

      await sanity.create(doc);
      console.log(`✅ created (${images.length} image${images.length !== 1 ? "s" : ""})`);
      created++;
    } catch (err) {
      console.log(`❌ error: ${err.message}`);
      errors++;
    }
  }

  console.log("\n─────────────────────────────────────");
  console.log(`✅ Created:  ${created}`);
  console.log(`⏭ Skipped:  ${skipped}`);
  console.log(`❌ Errors:   ${errors}`);
  console.log(`📦 Total:    ${posts.length}`);
  console.log("─────────────────────────────────────\n");
  console.log("Migration complete. Open Sanity Studio to review the imported listings.");
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});
