/**
 * ASTGSE WordPress → Sanity Migration Script
 *
 * Fetches equipment listings from astgse.com WordPress REST API,
 * downloads images, uploads to Sanity, and creates listing documents.
 *
 * Prerequisites:
 *   1. Add SANITY_WRITE_TOKEN to your .env.local
 *      (Sanity dashboard → API → Tokens → Add token → Editor)
 *   2. Run: node scripts/migrate-from-wp.mjs
 *
 * Safe to re-run — checks for existing slugs and skips duplicates.
 *
 * To import a specific category only, set CATEGORY below.
 * To import a single post by slug, set SINGLE_SLUG below.
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

// ─── Filter — set one of these to import a subset ─────────────────────────────
// Leave both null to import everything.
const FILTER_CATEGORY = "Ambulift"; // e.g. "Ambulift", or null for all
const SINGLE_SLUG     = null;       // e.g. "my-post-slug", or null for all

// ─── Sanity client ────────────────────────────────────────────────────────────

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "kcmbd43u",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET    || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token:     process.env.SANITY_WRITE_TOKEN,
  useCdn:    false,
});

// In-process image dedup — avoids re-uploading the same URL twice in one run
const uploadedAssets = new Map();

async function slugExists(slug) {
  const result = await sanity.fetch(
    `*[_type == "listing" && slug.current == $slug][0]._id`,
    { slug }
  );
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

  const categoryNames = Object.fromEntries(
    Object.entries(categories).map(([id, name]) => [id, name])
  );

  let posts = allPosts;
  if (SINGLE_SLUG) {
    posts = allPosts.filter((p) => p.slug === SINGLE_SLUG);
  } else if (FILTER_CATEGORY) {
    posts = allPosts.filter((p) =>
      (p.categories || []).some((id) => categoryNames[id] === FILTER_CATEGORY)
    );
  }

  console.log(`\n✅ Found ${posts.length} posts to import\n`);

  let created = 0;
  let skipped = 0;
  let errors  = 0;

  for (let i = 0; i < posts.length; i++) {
    const post  = posts[i];
    const slug  = toSanitySlug(post.slug);
    const title = normaliseBrands(stripHtml(post.title?.rendered || "Untitled"));

    process.stdout.write(`[${i + 1}/${posts.length}] ${title.slice(0, 60)}... `);

    if (await slugExists(slug)) {
      console.log("⏭ skipped (already exists)");
      skipped++;
      continue;
    }

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
