import type { MetadataRoute } from "next";

// PWA manifest — siteyi telefona "uygulama olarak ekle" ile kurulabilir yapar.
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Ay Bıçak - El Yapımı Premium Bıçaklar",
        short_name: "Ay Bıçak",
        description: "30 yıllık ustalıkla üretilen el yapımı bıçaklar. Av, kamp, mutfak bıçakları ve özel tasarım.",
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
        lang: "tr",
        categories: ["shopping"],
        icons: [
            { src: "/logo-icon.png", sizes: "192x192", type: "image/png" },
            { src: "/logo-icon.png", sizes: "512x512", type: "image/png" },
            { src: "/logo-icon.png", sizes: "any", type: "image/png", purpose: "maskable" },
        ],
    };
}
