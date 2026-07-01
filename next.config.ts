import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // iyzipay CommonJS dinamik require kullandığı için bundle edilemez;
  // çalışma zamanında Node tarafından yüklenir.
  serverExternalPackages: ["iyzipay"],
  images: {
    // Ürün görselleri artık public/products altında yerel WebP olarak tutuluyor;
    // remotePatterns yalnızca olası eski harici referanslar için korunuyor.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bicakmarket.com",
      },
      {
        // Admin panelinden yüklenen ürün görselleri (Vercel Blob)
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Bileşenlerde kullanılan quality değerleri (Next 16 varsayılanı yalnızca 75)
    qualities: [75, 85, 90],
  },
};

export default nextConfig;

