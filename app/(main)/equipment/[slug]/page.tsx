import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import EquipmentListingClient from "./_client";

export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://astgse.com";

type Listing = {
  _id: string;
  title: string;
  slug: string;
  make?: string;
  model?: string;
  year?: number;
  hours?: number | null;
  condition?: string;
  fuelType?: string;
  transmission?: string;
  category?: string;
  location?: string;
  serialNumber?: string;
  quantity?: string;
  availableFrom?: string;
  featured?: boolean;
  description?: string;
  specifications?: string;
  metaDescription?: string;
  status?: string[];
  mileage?: { amount?: number; unit?: "km" | "miles" };
  salePrice?: { amount?: number; currency?: string; onApplication?: boolean };
  hirePrice?: { amount?: number; currency?: string; period?: string; onApplication?: boolean };
  images?: { asset: { _ref: string } }[];
};

async function getListing(slug: string): Promise<Listing | null> {
  try {
    return await client.fetch(
      `*[_type == "listing" && slug.current == $slug && published == true][0]{
        _id, title, "slug": slug.current, make, model, year, hours, condition,
        fuelType, transmission, category, location, serialNumber, quantity,
        availableFrom, featured, description, specifications, metaDescription,
        status, mileage, salePrice, hirePrice,
        images[]{ asset }
      }`,
      { slug }
    );
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<{ slug: string }[]>(
      `*[_type == "listing" && published == true && defined(slug.current)]{ "slug": slug.current }`
    );
    return slugs.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: { absolute: "ASTGSE | Equipment" } };

  const title = [listing.year, listing.make, listing.model, listing.title].filter(Boolean).join(" ");
  const description =
    listing.metaDescription ||
    [
      listing.condition,
      listing.category,
      listing.make,
      listing.model,
      listing.location ? `available in ${listing.location}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

  const imageUrl = listing.images?.[0]
    ? urlFor(listing.images[0]).width(1200).height(630).url()
    : undefined;

  return {
    title: { absolute: `ASTGSE | ${title}` },
    description,
    alternates: { canonical: `${BASE_URL}/equipment/${slug}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/equipment/${slug}`,
      ...(imageUrl ? { images: [{ url: imageUrl, width: 1200, height: 630 }] } : {}),
    },
  };
}

export default async function EquipmentListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();

  const title = [listing.year, listing.make, listing.model, listing.title].filter(Boolean).join(" ");

  const heroImage = listing.images?.[0]
    ? urlFor(listing.images[0]).width(1200).height(800).url()
    : null;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description: listing.description ?? undefined,
    brand: listing.make ? { "@type": "Brand", name: listing.make } : undefined,
    model: listing.model ?? undefined,
    category: listing.category ?? undefined,
    image: heroImage ?? undefined,
    url: `${BASE_URL}/equipment/${slug}`,
    ...(listing.salePrice?.amount && !listing.salePrice.onApplication
      ? {
          offers: {
            "@type": "Offer",
            price: listing.salePrice.amount,
            priceCurrency: listing.salePrice.currency ?? "GBP",
            availability: "https://schema.org/InStock",
            url: `${BASE_URL}/equipment/${slug}`,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EquipmentListingClient listing={listing} heroImage={heroImage} title={title} />
    </>
  );
}
