import type { Metadata } from "next";
import { faqCategories } from "@/data/faq";
import { getFAQSchema } from "@/lib/schema";

export const metadata: Metadata = {
    title: "Sıkça Sorulan Sorular",
    description: "Ay Bıçak hakkında sıkça sorulan sorular. Sipariş, ödeme, ücretsiz kargo, garanti, bıçak bakımı ve iade koşulları hakkında bilgi alın.",
    alternates: {
        canonical: "https://aybicak.com/sss",
    },
    openGraph: {
        title: "Sıkça Sorulan Sorular | Ay Bıçak",
        description: "Sipariş, ödeme, kargo ve iade hakkında tüm sorularınızın yanıtları.",
        url: "https://aybicak.com/sss",
        type: "website",
        locale: "tr_TR",
    },
};

export default function SSSLayout({ children }: { children: React.ReactNode }) {
    const faqSchema = getFAQSchema(
        faqCategories.flatMap((category) =>
            category.questions.map((item) => ({ question: item.q, answer: item.a }))
        )
    );

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            {children}
        </>
    );
}
