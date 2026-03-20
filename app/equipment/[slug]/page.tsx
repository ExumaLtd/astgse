import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/app/components/navigation/Navbar";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";

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

function formatPrice(price: Listing["salePrice"], period?: string) {
  if (!price) return null;
  if (price.onApplication) return "Price on application";
  if (!price.amount) return null;
  const formatted = new Intl.NumberFormat("en-GB", { style: "currency", currency: price.currency ?? "GBP", maximumFractionDigits: 0 }).format(price.amount);
  return period ? `${formatted} / ${period}` : formatted;
}

export default async function EquipmentListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();

  const title = [listing.year, listing.make, listing.model, listing.title].filter(Boolean).join(" ");
  const salePrice = formatPrice(listing.salePrice);
  const hirePrice = formatPrice(listing.hirePrice, listing.hirePrice?.period);

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
    <div className="listing-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="listing-hero relative bg-blue text-white flex flex-col" style={{ minHeight: "100svh" }}>
        <Navbar />

        <div className="relative z-10 flex flex-col flex-1">
          <div className="max-w-[1440px] mx-auto w-full flex flex-col flex-1">
            <main className="flex flex-col flex-1 page-px pb-[60px]">

              {/* Breadcrumb */}
              <nav
                className="listing-breadcrumb flex items-center gap-[12px] pt-[10px] md:pt-4 pb-[30px] md:pb-[40px]"
                style={{ fontFamily: "var(--font-almaren-nueva)", fontSize: "0.875rem", fontWeight: 21 }}
                aria-label="Breadcrumb"
              >
                <Link href="/" className="listing-breadcrumb__link transition-colors" style={{ color: "rgba(255,255,255,0.40)" }}>Home</Link>
                <span style={{ color: "#00FF7E" }}>/</span>
                <Link href="/equipment" className="listing-breadcrumb__link transition-colors" style={{ color: "rgba(255,255,255,0.40)" }}>Equipment</Link>
                <span style={{ color: "#00FF7E" }}>/</span>
                <span style={{ color: "#ffffff" }}>{title}</span>
              </nav>

              {/* Content grid */}
              <div className="listing-grid grid grid-cols-1 lg:grid-cols-12 gap-[40px] lg:gap-[24px]">

                {/* Left: image */}
                <div className="listing-image-col lg:col-span-7">
                  {heroImage ? (
                    <div className="overflow-hidden w-full" style={{ borderRadius: 22, aspectRatio: "3 / 2" }}>
                      <Image
                        src={heroImage}
                        alt={title}
                        width={1200}
                        height={800}
                        className="listing-image w-full h-full object-cover"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-center" style={{ borderRadius: 22, aspectRatio: "3 / 2", backgroundColor: "rgba(255,255,255,0.06)" }}>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>No image available</span>
                    </div>
                  )}
                </div>

                {/* Right: details */}
                <div className="listing-details-col lg:col-span-5 flex flex-col gap-[24px]">

                  {listing.category && (
                    <p className="listing-category" style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", color: "#00FF7E", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {listing.category}
                    </p>
                  )}

                  <h1
                    className="listing-heading text-[1.75rem] leading-[2rem] md:text-[2.25rem] md:leading-[2.5rem]"
                    style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}
                  >
                    {title}
                  </h1>

                  {/* Price */}
                  {(salePrice || hirePrice) && (
                    <div className="listing-price flex flex-col gap-[8px]">
                      {salePrice && (
                        <p style={{ fontFamily: "var(--font-inter)", fontSize: "1.25rem", fontWeight: 600, color: "#00FF7E" }}>{salePrice}</p>
                      )}
                      {hirePrice && (
                        <p style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", color: "rgba(255,255,255,0.6)" }}>Hire: {hirePrice}</p>
                      )}
                    </div>
                  )}

                  {/* Specs */}
                  <dl className="listing-specs grid grid-cols-2 gap-x-[16px] gap-y-[12px]" style={{ fontFamily: "var(--font-inter)" }}>
                    {listing.condition && (
                      <>
                        <dt style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Condition</dt>
                        <dd style={{ fontSize: "0.875rem" }}>{listing.condition}</dd>
                      </>
                    )}
                    {listing.year && (
                      <>
                        <dt style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Year</dt>
                        <dd style={{ fontSize: "0.875rem" }}>{listing.year}</dd>
                      </>
                    )}
                    {listing.hours != null && (
                      <>
                        <dt style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Hours</dt>
                        <dd style={{ fontSize: "0.875rem" }}>{listing.hours.toLocaleString()}</dd>
                      </>
                    )}
                    {listing.fuelType && (
                      <>
                        <dt style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Fuel</dt>
                        <dd style={{ fontSize: "0.875rem" }}>{listing.fuelType}</dd>
                      </>
                    )}
                    {listing.location && (
                      <>
                        <dt style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Location</dt>
                        <dd style={{ fontSize: "0.875rem" }}>{listing.location}</dd>
                      </>
                    )}
                  </dl>

                  {listing.description && (
                    <p className="listing-description" style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", lineHeight: "1.5rem", color: "rgba(255,255,255,0.75)" }}>
                      {listing.description}
                    </p>
                  )}

                  {/* CTA */}
                  <div className="listing-cta" style={{ marginTop: 8 }}>
                    <a
                      href="#"
                      className="listing-enquire-btn inline-flex items-center hover:bg-[#00FF7E] hover:text-[#141127] transition-[background-color,color] duration-300 ease-out"
                      style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", paddingBlock: 8, paddingInlineStart: 20, paddingInlineEnd: 8, gap: 12, border: "1px solid #00FF7E", borderRadius: 100, color: "#ffffff" }}
                    >
                      Enquire about this unit
                      <span className="flex items-center justify-center rounded-full bg-[#00FF7E]" style={{ width: 30, height: 30 }}>
                        <ArrowRight size={14} color="#141127" strokeWidth={2.5} />
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}
