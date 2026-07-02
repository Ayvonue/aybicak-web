import type { Metadata, Viewport } from "next";
import { Lora, Figtree, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted via next/font: zero runtime font requests, no layout shift.
// Lora = calm literary serif for headlines; Figtree = warm humanist UI face;
// IBM Plex Mono = data surfaces (prices, timestamps, terminal rows).
const lora = Lora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});
const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Haber Terminali",
  description: "Düşük gecikmeli haber terminali — finans, oyun, hobi ve genel haberler.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0e14" },
    { media: "(prefers-color-scheme: light)", color: "#f4f3ee" },
  ],
};

// FOUC guard: resolves the theme before first paint. Kept tiny and inline.
const themeInit = `(function(){try{var t=localStorage.getItem("nt_theme");if(!t)t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${lora.variable} ${figtree.variable} ${plexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
