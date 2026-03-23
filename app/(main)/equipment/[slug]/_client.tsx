"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { type LC, isRtl } from "@/app/i18n/config";
import { useLang } from "@/app/hooks/useLang";

const UI: Record<LC, {
  breadHome: string;
  breadEquipment: string;
  noImage: string;
  enquire: string;
  priceOnApplication: string;
  hire: string;
  conditionLabel: string;
  yearLabel: string;
  hoursLabel: string;
  fuelLabel: string;
  locationLabel: string;
}> = {
  EN: {
    breadHome: "Home", breadEquipment: "Equipment",
    noImage: "No image available", enquire: "Enquire about this unit",
    priceOnApplication: "Price on application", hire: "Hire:",
    conditionLabel: "Condition", yearLabel: "Year", hoursLabel: "Hours",
    fuelLabel: "Fuel", locationLabel: "Location",
  },
  AR: {
    breadHome: "الرئيسية", breadEquipment: "المعدات",
    noImage: "لا توجد صورة متاحة", enquire: "استفسر عن هذه الوحدة",
    priceOnApplication: "السعر عند الطلب", hire: "إيجار:",
    conditionLabel: "الحالة", yearLabel: "السنة", hoursLabel: "الساعات",
    fuelLabel: "الوقود", locationLabel: "الموقع",
  },
  ES: {
    breadHome: "Inicio", breadEquipment: "Equipamiento",
    noImage: "No hay imagen disponible", enquire: "Consultar sobre esta unidad",
    priceOnApplication: "Precio a consultar", hire: "Alquiler:",
    conditionLabel: "Condición", yearLabel: "Año", hoursLabel: "Horas",
    fuelLabel: "Combustible", locationLabel: "Ubicación",
  },
  FR: {
    breadHome: "Accueil", breadEquipment: "Équipements",
    noImage: "Aucune image disponible", enquire: "Renseigner sur cette unité",
    priceOnApplication: "Prix sur demande", hire: "Location:",
    conditionLabel: "État", yearLabel: "Année", hoursLabel: "Heures",
    fuelLabel: "Carburant", locationLabel: "Emplacement",
  },
};

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

function formatPrice(price: Listing["salePrice"] | undefined, priceOnApplicationLabel: string, period?: string) {
  if (!price) return null;
  if (price.onApplication) return priceOnApplicationLabel;
  if (!price.amount) return null;
  const formatted = new Intl.NumberFormat("en-GB", { style: "currency", currency: price.currency ?? "GBP", maximumFractionDigits: 0 }).format(price.amount);
  return period ? `${formatted} / ${period}` : formatted;
}

type Props = {
  listing: Listing;
  heroImage: string | null;
  title: string;
};

export default function EquipmentListingClient({ listing, heroImage, title }: Props) {
  const lang = useLang();
  const t = UI[lang];

  const salePrice = formatPrice(listing.salePrice, t.priceOnApplication);
  const hirePrice = formatPrice(listing.hirePrice, t.priceOnApplication, listing.hirePrice?.period);

  return (
    <div className="listing-page" dir={isRtl(lang) ? "rtl" : "ltr"}>
      {/* Hero */}
      <section className="listing-hero relative bg-blue text-white flex flex-col" style={{ minHeight: "100svh" }}>
        <div className="relative z-10 flex flex-col flex-1 pt-[80px]">
          <div className="max-w-[1440px] mx-auto w-full flex flex-col flex-1">
            <main className="flex flex-col flex-1 page-px pb-[60px]">

              {/* Breadcrumb */}
              <nav
                className="listing-breadcrumb flex items-center gap-[12px] pt-[10px] md:pt-4 pb-[30px] md:pb-[40px]"
                style={{ fontFamily: "var(--font-almaren-nueva)", fontSize: "0.875rem", fontWeight: 21 }}
                aria-label="Breadcrumb"
              >
                <Link href="/" className="listing-breadcrumb__link transition-colors" style={{ color: "rgba(255,255,255,0.40)" }}>{t.breadHome}</Link>
                <span style={{ color: "#00FF7E" }}>/</span>
                <Link href="/equipment" className="listing-breadcrumb__link transition-colors" style={{ color: "rgba(255,255,255,0.40)" }}>{t.breadEquipment}</Link>
                <span style={{ color: "#00FF7E" }}>/</span>
                <span style={{ color: "#ffffff" }} translate="no">{title}</span>
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
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>{t.noImage}</span>
                    </div>
                  )}
                </div>

                {/* Right: details */}
                <div className="listing-details-col lg:col-span-5 flex flex-col gap-[24px]">

                  {listing.category && (
                    <p className="listing-category" translate="no" style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", color: "#00FF7E", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {listing.category}
                    </p>
                  )}

                  <h1
                    className="listing-heading text-[1.75rem] leading-[2rem] md:text-[2.25rem] md:leading-[2.5rem]"
                    style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}
                    translate="no"
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
                        <p style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", color: "rgba(255,255,255,0.6)" }}>{t.hire} {hirePrice}</p>
                      )}
                    </div>
                  )}

                  {/* Specs */}
                  <dl className="listing-specs grid grid-cols-2 gap-x-[16px] gap-y-[12px]" style={{ fontFamily: "var(--font-inter)" }}>
                    {listing.condition && (
                      <>
                        <dt style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.conditionLabel}</dt>
                        <dd style={{ fontSize: "0.875rem" }} translate="no">{listing.condition}</dd>
                      </>
                    )}
                    {listing.year && (
                      <>
                        <dt style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.yearLabel}</dt>
                        <dd style={{ fontSize: "0.875rem" }} translate="no">{listing.year}</dd>
                      </>
                    )}
                    {listing.hours != null && (
                      <>
                        <dt style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.hoursLabel}</dt>
                        <dd style={{ fontSize: "0.875rem" }} translate="no">{listing.hours.toLocaleString()}</dd>
                      </>
                    )}
                    {listing.fuelType && (
                      <>
                        <dt style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.fuelLabel}</dt>
                        <dd style={{ fontSize: "0.875rem" }} translate="no">{listing.fuelType}</dd>
                      </>
                    )}
                    {listing.location && (
                      <>
                        <dt style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.locationLabel}</dt>
                        <dd style={{ fontSize: "0.875rem" }} translate="no">{listing.location}</dd>
                      </>
                    )}
                  </dl>

                  {listing.description && (
                    <p className="listing-description" translate="no" style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", lineHeight: "1.5rem", color: "rgba(255,255,255,0.75)" }}>
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
                      {t.enquire}
                      <span className="flex items-center justify-center rounded-full bg-[#00FF7E]" style={{ width: 30, height: 30, transform: isRtl(lang) ? "scaleX(-1)" : undefined }}>
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
