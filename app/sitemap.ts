import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://astgse.com";

async function getListingSlugs(): Promise<string[]> {
  try {
    const slugs = await client.fetch<{ slug: string }[]>(
      `*[_type == "listing" && published == true && defined(slug.current)]{ "slug": slug.current }`
    );
    return slugs.map((s) => s.slug);
  } catch {
    return [];
  }
}

async function getServiceSlugs(): Promise<string[]> {
  try {
    const slugs = await client.fetch<{ slug: string }[]>(
      `*[_type == "servicePage" && defined(slug.current)]{ "slug": slug.current }`
    );
    return slugs.map((s) => s.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listingSlugs, serviceSlugs] = await Promise.all([
    getListingSlugs(),
    getServiceSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/equipment`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/newsroom`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  const listingRoutes: MetadataRoute.Sitemap = listingSlugs.map((slug) => ({
    url: `${BASE_URL}/equipment/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...serviceRoutes, ...listingRoutes];
}
