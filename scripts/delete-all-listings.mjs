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

const ids = await sanity.fetch(`*[_type == "listing"]._id`);
console.log(`Found ${ids.length} listings to delete...`);

for (const id of ids) {
  await sanity.delete(id);
  process.stdout.write(".");
}

console.log(`\n✅ Deleted ${ids.length} listings.`);
