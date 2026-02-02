import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { AuthProvider } from "@/context/AuthContext";
import { SpeedInsights } from "@vercel/speed-insights/next";

import SmoothScroll from "@/components/shared/SmoothScroll";
import ScrollToTop from "@/components/shared/ScrollToTop";
import BackgroundLayer from "@/components/shared/BackgroundLayer";
import CookieBanner from "@/components/shared/CookieBanner";

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aybicak.com"),
  title: {
    default: "Ay Bıçak | El Yapımı Premium Bıçaklar",
    template: "%s | Ay Bıçak"
  },
  description: "30 yıllık ustalıkla üretilen el yapımı bıçaklar. Av bıçağı, kamp bıçağı, mutfak bıçağı ve özel tasarım. Ücretsiz kargo, 1 yıl garanti. ₺500'den başlayan fiyatlar.",
  keywords: ["el yapımı bıçak", "av bıçağı", "kamp bıçağı", "mutfak bıçağı", "türk bıçağı", "özel tasarım bıçak", "n690 bıçak", "paslanmaz çelik bıçak", "ay bıçak"],
  authors: [{ name: "Ay Bıçak" }],
  creator: "Ay Bıçak",
  publisher: "Ay Bıçak",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Ay Bıçak",
    title: "Ay Bıçak | El Yapımı Premium Bıçaklar",
    description: "30 yıllık ustalıkla üretilen el yapımı bıçaklar. Av, kamp, mutfak bıçakları. Ücretsiz kargo ve garanti.",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "Ay Bıçak - El Yapımı Premium Bıçaklar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ay Bıçak | El Yapımı Premium Bıçaklar",
    description: "30 yıllık ustalıkla üretilen el yapımı bıçaklar.",
    images: ["/hero.png"],
  },
  verification: {
    google: "google-site-verification-code", // TODO: Add actual verification code
  },
  alternates: {
    canonical: "https://aybicak.com",
  },
  icons: {
    icon: "/logo-icon.png", // Standart Favicon
    shortcut: "/logo-icon.png",
    apple: "/logo-icon.png", // iOS Ana Ekran İkonu
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/logo-icon.png",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Ay Bıçak",
    "url": "https://aybicak.com",
    "logo": "https://aybicak.com/logo-full.png",
    "description": "30 yıllık ustalıkla üretilen el yapımı premium bıçaklar",
    "sameAs": ["https://www.instagram.com/aybicak"]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Ay Bıçak",
    "url": "https://aybicak.com"
  };

  return (
    <html lang="tr" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased font-sans text-foreground">
        <BackgroundLayer />
        <SmoothScroll />
        <FavoritesProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <ScrollToTop />
              <CookieBanner />
              <div className="titanium-sheen" />
            </CartProvider>
          </AuthProvider>
        </FavoritesProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
