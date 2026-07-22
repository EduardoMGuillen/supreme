import type { Metadata } from "next";
import { Archivo_Black, Outfit } from "next/font/google";
import { AnnouncementTicker } from "@/components/AnnouncementTicker";
import { LiveBanner } from "@/components/LiveBanner";
import { PublicChrome } from "@/components/PublicChrome";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { isAnnouncementVisible, SITE_URL } from "@/lib/site";
import { readStore } from "@/lib/store";
import "./globals.css";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Supremo | Humor, música y partidos",
    template: "%s | Supremo",
  },
  description:
    "Sitio oficial de Supremo. Contenido, música, eventos, lives y colaboraciones desde Honduras.",
  openGraph: {
    type: "website",
    locale: "es_HN",
    url: SITE_URL,
    siteName: "Supremo",
    title: "Supremo",
    description:
      "Humor, música y partidos entre selecciones de tiktokers. El hub oficial de Supremo.",
    images: [{ url: "/foto-supremo.jpg", width: 1200, height: 1200 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Supremo",
    description: "Humor, música y partidos. Desde Honduras.",
    images: ["/foto-supremo.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await readStore();
  const announcements = store.announcements
    .filter((a) => isAnnouncementVisible(a))
    .sort((a, b) => a.order - b.order);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Supremo",
    alternateName: ["Lester Cardona", "SoySupremo"],
    url: SITE_URL,
    image: `${SITE_URL}/foto-supremo.jpg`,
    sameAs: Object.values(store.config.handles),
    jobTitle: "Influencer, comediante y cantante",
    nationality: "Honduran",
  };

  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen flex flex-col bg-bg text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PublicChrome
          ticker={<AnnouncementTicker items={announcements} />}
          live={<LiveBanner live={store.liveStatus} />}
          header={<SiteHeader />}
          footer={<SiteFooter config={store.config} />}
        >
          {children}
        </PublicChrome>
      </body>
    </html>
  );
}
