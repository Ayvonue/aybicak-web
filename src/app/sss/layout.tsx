import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sıkça Sorulan Sorular",
    description: "AYBIÇAK hakkında sıkça sorulan sorular. Sipariş, ödeme, kargo, garanti ve iade koşulları hakkında bilgi alın.",
    openGraph: {
        title: "Sıkça Sorulan Sorular | Ay Bıçak",
        description: "Sipariş, ödeme, kargo ve iade hakkında tüm sorularınızın yanıtları.",
    },
};

export default function SSSLayout({ children }: { children: React.ReactNode }) {
    return children;
}
