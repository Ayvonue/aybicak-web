import type { Metadata } from 'next';
import { products } from '@/data/products';

export const metadata: Metadata = {
    title: 'Mağaza - El Yapımı Bıçak Koleksiyonu',
    description: 'Ay Bıçak el yapımı bıçak koleksiyonu: av bıçağı, kamp bıçağı, çakı, mutfak bıçak setleri ve kılıçlar. N690 Böhler çelik, geyik boynuzu ve ceviz kabze. Ücretsiz kargo.',
    keywords: ['el yapımı bıçak satın al', 'av bıçağı fiyatları', 'kamp bıçağı', 'çakı modelleri', 'mutfak bıçak seti', 'n690 bıçak', 'yatağan bıçak'],
    alternates: {
        canonical: 'https://aybicak.com/shop',
    },
    openGraph: {
        title: 'El Yapımı Bıçak Koleksiyonu | Ay Bıçak',
        description: 'Av, kamp, mutfak bıçakları ve çakılar. N690 çelik, el yapımı, ücretsiz kargo ve 1 yıl garanti.',
        url: 'https://aybicak.com/shop',
        type: 'website',
        locale: 'tr_TR',
    },
};

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Koleksiyon sayfası şeması — tüm katalog arama motorlarına tanıtılır
    const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "El Yapımı Bıçak Koleksiyonu",
        "url": "https://aybicak.com/shop",
        "description": "Ay Bıçak el yapımı bıçak, çakı, kılıç ve mutfak seti koleksiyonu.",
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": products.length,
            "itemListElement": products.slice(0, 50).map((product, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": product.name.trim(),
                "url": `https://aybicak.com/product/${product.id}`,
            })),
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />
            {children}
        </>
    );
}
