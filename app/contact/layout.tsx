const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://astgse.com";

export const metadata = {
  title: { absolute: "ASTGSE | Contact" },
  description: "Get in touch with AST GSE — enquiries about equipment, maintenance, hire, and brokerage.",
  alternates: { canonical: `${BASE_URL}/contact` },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
