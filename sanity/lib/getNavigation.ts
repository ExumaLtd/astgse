import { createClient } from "next-sanity";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "kcmbd43u",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: true,
});

export type NavChild = {
  labelEN: string;
  labelAR: string;
  labelES: string;
  labelFR: string;
  href: string;
};

export type NavItem = {
  labelEN: string;
  labelAR: string;
  labelES: string;
  labelFR: string;
  href: string;
  hasChevron: boolean;
  children?: NavChild[];
};

export type NavData = {
  navItems: NavItem[];
  contactLabelEN: string;
  contactLabelAR: string;
  contactLabelES: string;
  contactLabelFR: string;
  contactHref: string;
};

export async function getNavigation(): Promise<NavData | null> {
  try {
    return await client.fetch<NavData>(
      `*[_type == "navigation" && _id == "navigation"][0]{
        navItems[]{
          labelEN, labelAR, labelES, labelFR, href, hasChevron,
          children[]{ labelEN, labelAR, labelES, labelFR, href }
        },
        contactLabelEN, contactLabelAR, contactLabelES, contactLabelFR, contactHref
      }`,
      {},
      { next: { revalidate: 60 } }
    );
  } catch {
    return null;
  }
}
