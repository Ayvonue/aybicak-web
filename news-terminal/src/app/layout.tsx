import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haber Terminali",
  description: "Düşük gecikmeli haber terminali — finans, oyun, hobi ve genel haberler.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
