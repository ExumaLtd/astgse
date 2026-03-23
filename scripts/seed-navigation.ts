import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "kcmbd43u",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function seed() {
  console.log("Seeding navigation document...");

  const result = await writeClient.createOrReplace({
    _id: "navigation",
    _type: "navigation",
    navItems: [
      { _key: "services",  labelEN: "Services",  labelAR: "الخدمات",    labelES: "Servicios",   labelFR: "Services",    href: "/services/maintenance-and-diagnostics", hasChevron: true },
      { _key: "equipment", labelEN: "Equipment", labelAR: "المعدات",    labelES: "Equipamiento", labelFR: "Équipements", href: "/equipment", hasChevron: true },
      { _key: "about",     labelEN: "About",     labelAR: "عن الشركة",  labelES: "Acerca de",   labelFR: "À propos",    href: "", hasChevron: false },
      { _key: "careers",   labelEN: "Careers",   labelAR: "وظائف",      labelES: "Empleos",     labelFR: "Carrières",   href: "", hasChevron: false },
      { _key: "newsroom",  labelEN: "Newsroom",  labelAR: "الأخبار",    labelES: "Noticias",    labelFR: "Actualités",  href: "/newsroom", hasChevron: false },
    ],
    contactLabelEN: "Contact us",
    contactLabelAR: "اتصل بنا",
    contactLabelES: "Contáctenos",
    contactLabelFR: "Nous contacter",
    contactHref: "/contact",
  });

  console.log("Navigation document created/replaced:", result._id);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
