import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Özel Tasarım Bıçak",
    description: "Hayalinizdeki bıçağı birlikte tasarlayalım. Çelik, kabza ve yüzey işlemi seçenekleriyle kişiye özel el yapımı bıçak üretimi. Kurumsal ve toptan çözümler.",
};

export default function CustomLayout({ children }: { children: React.ReactNode }) {
    return children;
}
