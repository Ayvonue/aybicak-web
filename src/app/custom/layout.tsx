import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Özel Tasarım Bıçak",
    description: "Hayalinizdeki bıçağı birlikte tasarlayalım. N690, M390 ve Damascus çelik; ceviz, geyik boynuzu ve epoksi kabze seçenekleriyle kişiye özel el yapımı bıçak üretimi. Kurumsal ve toptan çözümler.",
    keywords: ["özel tasarım bıçak", "kişiye özel bıçak", "isme özel bıçak", "el yapımı özel bıçak", "kurumsal bıçak", "şef bıçağı özel üretim", "damascus bıçak"],
    alternates: {
        canonical: "https://aybicak.com/custom",
    },
    openGraph: {
        title: "Özel Tasarım Bıçak | Ay Bıçak",
        description: "Çelik, kabza ve yüzey işlemini siz seçin; hayalinizdeki bıçağı usta ellerle üretelim.",
        url: "https://aybicak.com/custom",
        type: "website",
        locale: "tr_TR",
    },
};

export default function CustomLayout({ children }: { children: React.ReactNode }) {
    return children;
}
