import { notFound } from "next/navigation";
import { products } from "@/data/products";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import { Metadata } from "next";
import { normalizeTR } from "@/lib/utils";

// Generate SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const product = products.find((p) => p.id === resolvedParams.id);

    if (!product) {
        return {
            title: "Ürün Bulunamadı | Ay Bıçak",
        };
    }

    const cleanName = normalizeTR(product.name);
    const description = normalizeTR(product.description || "").slice(0, 160);

    return {
        title: `${cleanName} | Ay Bıçak`,
        description: description,
        openGraph: {
            title: `${cleanName} | Ay Bıçak`,
            description: description,
            images: [
                {
                    url: product.imageUrl,
                    width: 800,
                    height: 800,
                    alt: cleanName,
                },
            ],
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

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.imageUrl,
        "description": product.description || product.name,
        "brand": {
            "@type": "Brand",
            "name": "Ay Bıçak"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://aybicak.com/product/${product.id}`,
            "priceCurrency": "TRY",
            "price": product.price,
            "availability": "https://schema.org/InStock",
            "condition": "https://schema.org/NewCondition"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetailClient product={product} relatedProducts={relatedProducts} />
        </>
    );
}
