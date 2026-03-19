/**
 * ASTGSE Weekly Sync Script
 *
 * Runs weekly (via GitHub Actions) to:
 *  - Import new listings from astgse.com that aren't yet in Sanity
 *  - Set published: false on Sanity listings that have been removed from the WP site
 *
 * Never deletes Sanity records — just unpublishes them so you keep the history.
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "kcmbd43u",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const WP_BASE = "https://astgse.com/wp-json/wp/v2";

// ─── Shared helpers (duplicated from migrate script for standalone use) ────────

function randomKey() {
  return Math.random().toString(36).slice(2, 10);
}

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

function toSanitySlug(wpSlug) {
  return wpSlug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}

const STRIP_PHRASES = /\b(enquire|more information|contact us|enquire now|get a quote|request info)\b/gi;
const SPEC_LABELS = "Make|Manufacturer|Model|Year|Mileage|Operation hours|Hours of Mileage|Hours|Engine|Gearbox|Chassis|Condition|Serial number|Serial|Location|Price|Shipping|Quantity";

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

const CATEGORY_MAP = {
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

async function fetchAllWpPosts() {
  const posts = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await fetch(`${WP_BASE}/posts?per_page=100&page=${page}&_embed=true&status=publish`);
    if (!res.ok) break;
    totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
    posts.push(...await res.json());
    page++;
  } while (page <= totalPages);
  return posts;
}

async function fetchCategories() {
  const res = await fetch(`${WP_BASE}/categories?per_page=100`);
  const data = await res.json();
  return Object.fromEntries(data.map((c) => [c.id, c.name]));
}

const uploadedAssets = new Map();

async function uploadImage(url) {
  if (uploadedAssets.has(url)) return uploadedAssets.get(url);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ASTGSE-Sync/1.0)" },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = url.split("/").pop()?.split("?")[0] || "image.jpg";
    const asset = await sanity.assets.upload("image", buffer, { filename, contentType });
    const ref = { _key: randomKey(), _type: "image", asset: { _type: "reference", _ref: asset._id } };
    uploadedAssets.set(url, ref);
    return ref;
  } catch {
    return null;
  }
}

async function getPostImages(post) {
  const images = [];
  const featured = post._embedded?.["wp:featuredmedia"]?.[0];
  if (featured?.source_url) {
    const ref = await uploadImage(featured.source_url);
    if (ref) images.push(ref);
  }
  const contentHtml = post.content?.rendered || "";
  const imgMatches = [...contentHtml.matchAll(/https:\/\/astgse\.com\/wp-content\/uploads\/[^\s"'>]+\.(?:jpg|jpeg|png|webp)/gi)];
  const extraUrls = [...new Set(imgMatches.map((m) => m[0]).filter((u) => !/-\d+x\d+\.(jpg|jpeg|png|webp)$/i.test(u)))];
  for (const url of extraUrls) {
    if (url === featured?.source_url) continue;
    const ref = await uploadImage(url);
    if (ref) images.push(ref);
  }
  return images;
}

function parseSpecs(post) {
  const content = stripHtml(post.content?.rendered || "");
  const excerpt = stripHtml(post.excerpt?.rendered || "");
  const specs = excerpt;
  const full = `${content} ${excerpt}`;

  const make  = extractField(specs, "Make", "Manufacturer");
  const model = extractField(specs, "Model");
  const yearStr = extractField(specs, "Year");
  const year = yearStr ? parseInt(yearStr, 10) || null : null;
  const mileageStr = extractField(specs, "Mileage");
  const mileage = mileageStr ? parseInt(mileageStr.replace(/[^\d]/g, ""), 10) || null : null;
  const hoursStr = extractField(specs, "Operation hours", "Hours of Mileage", "Hours");
  const hours = hoursStr ? parseInt(hoursStr.replace(/[^\d]/g, ""), 10) || null : null;
  const location = extractField(specs, "Location");
  const serialNumber = extractField(specs, "Serial number", "Serial");

  let quantity = null;
  const qtyMatch = full.match(/(\d+)\s+units?\s+(?:in stock|available)/i);
  if (qtyMatch) quantity = qtyMatch[1];
  else if (/multiple units/i.test(full)) quantity = "Multiple";

  let fuelType = null;
  if (/\bdiesel\b/i.test(full))        fuelType = "Diesel";
  else if (/\belectric\b/i.test(full)) fuelType = "Electric";
  else if (/\bpetrol\b/i.test(full))   fuelType = "Petrol";
  else if (/\bhybrid\b/i.test(full))   fuelType = "Hybrid";
  else if (/\blpg\b/i.test(full))      fuelType = "LPG";

  let transmission = null;
  if (/\bauto(?:matic)?\b/i.test(full))  transmission = "Automatic";
  else if (/\bmanual\b/i.test(full))     transmission = "Manual";

  let price = null;
  let priceOnApplication = false;
  const priceMatch = full.match(/£\s*([\d,]+)/);
  if (priceMatch) price = parseInt(priceMatch[1].replace(/,/g, ""), 10) || null;
  else priceOnApplication = true;

  const status = [];
  if (/\bfor sale\b/i.test(full)) status.push("For Sale");
  if (/\bfor hire\b/i.test(full)) status.push("For Hire");
  if (status.length === 0) status.push("For Sale");

  let description = null;
  const descMatch = content.match(/\bDescription\b[:\s]+(.+?)(?=\s*\b(?:Enquire|Make|Manufacturer|Model|Year|Price)\b|$)/i);
  if (descMatch) description = descMatch[1].replace(STRIP_PHRASES, "").replace(/\s+/g, " ").trim() || null;

  return { make, model, year, mileage, hours, fuelType, transmission, quantity, location, serialNumber, price, priceOnApplication, status, description };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.SANITY_WRITE_TOKEN) {
    console.error("❌ SANITY_WRITE_TOKEN not set");
    process.exit(1);
  }

  console.log("🔄 Weekly sync: astgse.com WordPress → Sanity\n");

  // Fetch everything in parallel
  const [wpPosts, categories, sanityListings] = await Promise.all([
    fetchAllWpPosts(),
    fetchCategories(),
    sanity.fetch(`*[_type == "listing"]{ _id, "slug": slug.current, published }`),
  ]);

  const wpSlugs = new Set(wpPosts.map((p) => toSanitySlug(p.slug)));
  const sanitySlugs = new Map(sanityListings.map((l) => [l.slug, l]));

  console.log(`WP listings:     ${wpPosts.length}`);
  console.log(`Sanity listings: ${sanityListings.length}\n`);

  // ── 1. Unpublish Sanity listings that no longer exist on WP ──────────────
  let unpublished = 0;
  for (const [slug, listing] of sanitySlugs) {
    if (!wpSlugs.has(slug) && listing.published !== false) {
      await sanity.patch(listing._id).set({ published: false }).commit();
      console.log(`📴 Unpublished (removed from WP): ${slug}`);
      unpublished++;
    }
  }

  // ── 2. Import new WP listings not yet in Sanity ───────────────────────────
  let created = 0;
  let errors = 0;

  for (const post of wpPosts) {
    const slug = toSanitySlug(post.slug);
    if (sanitySlugs.has(slug)) continue; // already exists

    const title = stripHtml(post.title?.rendered || "Untitled");
    process.stdout.write(`➕ Importing: ${title.slice(0, 60)}... `);

    try {
      const wpCategoryIds = post.categories || [];
      const wpCategoryNames = wpCategoryIds.map((id) => categories[id]).filter(Boolean);
      const sanityCategory = wpCategoryNames.map((n) => CATEGORY_MAP[n]).find(Boolean) || "Other GSE";
      const specs = parseSpecs(post);
      const images = await getPostImages(post);

      const doc = {
        _type: "listing",
        title,
        slug: { _type: "slug", current: slug },
        published: true,
        category: sanityCategory,
        status: specs.status,
        make: specs.make || undefined,
        model: specs.model || undefined,
        year: specs.year || undefined,
        mileage: specs.mileage || undefined,
        hours: specs.hours || undefined,
        fuelType: specs.fuelType || undefined,
        transmission: specs.transmission || undefined,
        quantity: specs.quantity ?? undefined,
        price: specs.price || undefined,
        priceOnApplication: specs.priceOnApplication,
        description: specs.description || undefined,
        images: images.length > 0 ? images : undefined,
        location: specs.location || undefined,
        serialNumber: specs.serialNumber || undefined,
        featured: false,
      };
      Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);

      await sanity.create(doc);
      console.log(`✅ (${images.length} image${images.length !== 1 ? "s" : ""})`);
      created++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      errors++;
    }
  }

  console.log("\n─────────────────────────────────────");
  console.log(`➕ New imports:  ${created}`);
  console.log(`📴 Unpublished: ${unpublished}`);
  console.log(`❌ Errors:      ${errors}`);
  console.log("─────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("💥 Fatal:", err);
  process.exit(1);
});
