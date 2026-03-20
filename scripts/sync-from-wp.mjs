/**
 * ASTGSE Weekly Sync Script
 *
 * Runs weekly (via GitHub Actions) to:
 *  - Import new listings from astgse.com that aren't yet in Sanity
 *  - Set published: false on Sanity listings removed from the WP site
 *
 * Never deletes Sanity records — just unpublishes to preserve history.
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";
import {
  CATEGORY_MAP,
  fetchAllPosts,
  fetchCategories,
  getPostImages,
  parseSpecs,
  buildListingDoc,
  toSanitySlug,
  normaliseBrands,
  stripHtml,
} from "./lib/wp-helpers.mjs";

config({ path: resolve(process.cwd(), ".env.local") });

const sanity = createClient({
  projectId:  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID  || "kcmbd43u",
  dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET     || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token:      process.env.SANITY_WRITE_TOKEN,
  useCdn:     false,
});

// In-process image dedup
const uploadedAssets = new Map();

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.SANITY_WRITE_TOKEN) {
    console.error("❌ SANITY_WRITE_TOKEN not set");
    process.exit(1);
  }

  console.log("🔄 Weekly sync: astgse.com WordPress → Sanity\n");

  const [wpPosts, categories, sanityListings] = await Promise.all([
    fetchAllPosts(),
    fetchCategories(),
    sanity.fetch(`*[_type == "listing"]{ _id, "slug": slug.current, published }`),
  ]);

  const wpSlugs     = new Set(wpPosts.map((p) => toSanitySlug(p.slug)));
  const sanitySlugs = new Map(sanityListings.map((l) => [l.slug, l]));

  console.log(`WP listings:     ${wpPosts.length}`);
  console.log(`Sanity listings: ${sanityListings.length}\n`);

  // ── 1. Unpublish Sanity listings removed from WP ──────────────────────────
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
  let errors  = 0;

  for (const post of wpPosts) {
    const slug = toSanitySlug(post.slug);
    if (sanitySlugs.has(slug)) continue;

    const title = normaliseBrands(stripHtml(post.title?.rendered || "Untitled"));
    process.stdout.write(`➕ Importing: ${title.slice(0, 60)}... `);

    try {
      const wpCategoryIds   = post.categories || [];
      const wpCategoryNames = wpCategoryIds.map((id) => categories[id]).filter(Boolean);
      const sanityCategory  = wpCategoryNames
        .map((n) => CATEGORY_MAP[n] || CATEGORY_MAP[n.replace(/&amp;/g, "&")])
        .find(Boolean) || "Other GSE";

      const specs  = parseSpecs(post);
      const images = await getPostImages(post, sanity, uploadedAssets);
      const doc    = buildListingDoc(post, specs, images, sanityCategory);

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
