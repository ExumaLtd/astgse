import type { Metadata, Viewport } from "next";
import { Inter, DM_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import ScrollRestoration from "@/app/components/ScrollRestoration";

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
  src: "./fonts/Almarena_Neue_Variable.ttf",
  variable: "--font-almaren-nueva",
});

export const viewport: Viewport = {
  themeColor: "#141127",
};

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
      <head>
        <meta name="theme-color" content="#141127" />
      </head>
      <body
        className={`${inter.variable} ${dmMono.variable} ${almarenaNueva.variable} ${ibmPlexSansArabic.variable} antialiased`}
      >
        <ScrollRestoration />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
