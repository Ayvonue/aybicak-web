import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import { Metadata } from "next";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { getProductSchema, getBreadcrumbSchema } from "@/lib/schema";
import { getCategoryByName } from "@/data/categories";
import { getAllProducts, getProductById } from "@/lib/products-source";
import { listReviews, getRatingSummary } from "@/lib/reviews";
import ProductReviews from "@/components/shop/ProductReviews";
import type { Product } from "@/types";

// Ürün sayfaları build sırasında üretilir; yeni/güncellenen ürünler için
// ISR ile en fazla 5 dakikada bir tazelenir (admin değişiklikleri yansır).
export async function generateStaticParams() {
    const products = await getAllProducts();
    return products.map((product) => ({ id: product.id }));
}

export const dynamicParams = true;
export const revalidate = 300;

// Ürün özelliklerinden benzersiz meta açıklama üretir; katalogdaki şablon
// açıklamaların yarattığı yinelenen içerik (duplicate content) sorununu çözer.
function buildMetaDescription(product: Product): string {
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
    const product = await getProductById(resolvedParams.id);

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
    const product = await getProductById(resolvedParams.id);

    if (!product) {
        return notFound();
    }

    const allProducts = await getAllProducts();
    const relatedProducts = allProducts.filter(
        (p) => p.category === product.category && p.id !== product.id
    );

    const [reviews, ratingSummary] = await Promise.all([
        listReviews(product.id),
        getRatingSummary(product.id),
    ]);

    const productSchema = getProductSchema(product, ratingSummary);
    const categoryConfig = getCategoryByName(product.category);
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: "Ana Sayfa", url: "https://aybicak.com" },
        ...(categoryConfig
            ? [{ name: categoryConfig.h1, url: `https://aybicak.com/category/${categoryConfig.slug}` }]
            : [{ name: "Mağaza", url: "https://aybicak.com/shop" }]),
        { name: product.name.trim(), url: `https://aybicak.com/product/${product.id}` },
    ]);

    // Kategoriye özel bakım rehberi — içerik derinliği ve kategori sayfasına
    // iç linkleme sağlar
    const categoryContent = categoryConfig ? (
        <section className="pb-16 px-6">
            <div className="max-w-7xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
                <h2 className="text-xl font-bold text-white">{categoryConfig.careTitle}</h2>
                {categoryConfig.careContent.map((paragraph, idx) => (
                    <p key={idx} className="text-sm text-zinc-400 leading-relaxed">{paragraph}</p>
                ))}
                <Link
                    href={`/category/${categoryConfig.slug}`}
                    className="inline-block text-sm text-yellow-500 hover:text-yellow-400 font-medium pt-2"
                >
                    Tüm {categoryConfig.h1} →
                </Link>
            </div>
        </section>
    ) : undefined;

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
            <ProductDetailClient
                product={product}
                relatedProducts={relatedProducts}
                categoryContent={categoryContent}
                reviewsSlot={
                    <ProductReviews
                        productId={product.id}
                        initialReviews={reviews}
                        average={ratingSummary?.average || 0}
                        count={ratingSummary?.count || 0}
                    />
                }
            />
        </>
    );
}
