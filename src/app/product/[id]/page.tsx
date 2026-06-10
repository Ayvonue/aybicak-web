import { notFound } from "next/navigation";
import { products } from "@/data/products";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import { Metadata } from "next";
import { formatPrice } from "@/lib/utils";
import { getProductSchema, getBreadcrumbSchema } from "@/lib/schema";

// Tüm ürün sayfaları build sırasında statik üretilir (SSG) — daha hızlı
// yükleme ve daha iyi tarama bütçesi kullanımı sağlar.
export function generateStaticParams() {
    return products.map((product) => ({ id: product.id }));
}

export const dynamicParams = false;

// Ürün özelliklerinden benzersiz meta açıklama üretir; katalogdaki şablon
// açıklamaların yarattığı yinelenen içerik (duplicate content) sorununu çözer.
function buildMetaDescription(product: (typeof products)[number]): string {
    const parts = [
        `${product.name.trim()}`,
        `${product.steel} çelik, ${product.hardness} sertlik, ${product.handle} kabze`,
    ];
    if (product.fullLength) parts.push(`${product.fullLength} toplam uzunluk`);
    parts.push(`${formatPrice(product.price)} — ücretsiz kargo, 1 yıl garanti, %100 el yapımı.`);
    return parts.join(". ").slice(0, 160);
}

// Generate SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const product = products.find((p) => p.id === resolvedParams.id);

    if (!product) {
        return {
            title: "Ürün Bulunamadı",
        };
    }

    const cleanName = product.name.trim();
    const description = buildMetaDescription(product);
    const url = `https://aybicak.com/product/${product.id}`;

    return {
        // Kök layout'taki "%s | Ay Bıçak" şablonu marka ekini otomatik ekler
        title: `${cleanName} - ${product.category}`,
        description,
        keywords: [
            cleanName,
            product.category,
            `${product.steel} bıçak`,
            `${product.handle} kabze`,
            "el yapımı bıçak",
            "ay bıçak",
        ],
        alternates: {
            canonical: url,
        },
        openGraph: {
            type: "website",
            url,
            siteName: "Ay Bıçak",
            locale: "tr_TR",
            title: `${cleanName} | Ay Bıçak`,
            description,
            images: [
                {
                    url: product.imageUrl,
                    width: 800,
                    height: 800,
                    alt: `${cleanName} - ${product.category} - Ay Bıçak`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${cleanName} | Ay Bıçak`,
            description,
            images: [product.imageUrl],
        },
    };
}

// Server Component
export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const product = products.find((p) => p.id === resolvedParams.id);

    if (!product) {
        return notFound();
    }

    const relatedProducts = products.filter(
        (p) => p.category === product.category && p.id !== product.id
    );

    const productSchema = getProductSchema(product.id);
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: "Ana Sayfa", url: "https://aybicak.com" },
        { name: "Mağaza", url: "https://aybicak.com/shop" },
        { name: product.name.trim(), url: `https://aybicak.com/product/${product.id}` },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <ProductDetailClient product={product} relatedProducts={relatedProducts} />
        </>
    );
}
