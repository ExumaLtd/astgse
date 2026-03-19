import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, DM_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
});

const almarenaNueva = localFont({
  src: "./fonts/AlmarenaNeueDemoVF.ttf",
  variable: "--font-almaren-nueva",
});

export const metadata: Metadata = {
  title: {
    default: "ASTGSE",
    template: "ASTGSE | %s",
  },
  description: "AST GSE — Ground support equipment sales, hire, brokerage and maintenance.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${dmMono.variable} ${almarenaNueva.variable} ${ibmPlexSansArabic.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
        {/* Google Translate — hidden widget, controlled by language switcher */}
        <div id="google_translate_element" style={{ display: "none" }} />
        <Script id="google-translate-init" strategy="afterInteractive">{`
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'ar', autoDisplay: false }, 'google_translate_element');
          }
        `}</Script>
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
      </body>
    </html>
  );
}
