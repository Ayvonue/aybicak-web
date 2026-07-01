import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import KnifeCard from "@/components/shared/KnifeCard";
import { categories, getCategoryBySlug } from "@/data/categories";
import { getBreadcrumbSchema } from "@/lib/schema";
import { getAllProducts } from "@/lib/products-source";

export function generateStaticParams() {
    return categories.map((category) => ({ slug: category.slug }));
}

export const dynamicParams = false;
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const config = getCategoryBySlug(slug);
    if (!config) return { title: "Kategori Bulunamadı" };

    const url = `https://aybicak.com/category/${config.slug}`;
    return {
        title: config.title,
        description: config.metaDescription,
        keywords: config.keywords,
        alternates: { canonical: url },
        openGraph: {
            title: `${config.title} | Ay Bıçak`,
            description: config.metaDescription,
            url,
            type: "website",
            locale: "tr_TR",
        },
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const config = getCategoryBySlug(slug);
    if (!config) return notFound();

    const allProducts = await getAllProducts();
    const categoryProducts = allProducts.filter((p) => p.category === config.category);

    const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": config.title,
        "url": `https://aybicak.com/category/${config.slug}`,
        "description": config.metaDescription,
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": categoryProducts.length,
            "itemListElement": categoryProducts.map((product, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": product.name.trim(),
                "url": `https://aybicak.com/product/${product.id}`,
            })),
        },
    };

    const breadcrumbSchema = getBreadcrumbSchema([
        { name: "Ana Sayfa", url: "https://aybicak.com" },
        { name: "Mağaza", url: "https://aybicak.com/shop" },
        { name: config.h1, url: `https://aybicak.com/category/${config.slug}` },
    ]);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <Navbar />

            {/* Header */}
            <section className="pt-36 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <nav aria-label="breadcrumb" className="text-xs text-zinc-500 mb-4 flex items-center gap-2">
                        <Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
                        <span>/</span>
                        <Link href="/shop" className="hover:text-white transition-colors">Mağaza</Link>
                        <span>/</span>
                        <span className="text-zinc-300">{config.h1}</span>
                    </nav>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{config.h1}</h1>
                    <p className="text-zinc-400 max-w-3xl leading-relaxed">{config.intro}</p>
                    <p className="text-sm text-zinc-500 mt-4">{categoryProducts.length} ürün</p>
                </div>
            </section>

            {/* Product Grid */}
            <section className="pb-16 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                    {categoryProducts.map((product) => (
                        <KnifeCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            price={product.price}
                            imageUrl={product.imageUrl}
                            steel={product.steel}
                            isNew={product.isNew}
                        />
                    ))}
                </div>
            </section>

            {/* SEO İçerik Bloğu */}
            <section className="pb-20 px-6">
                <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
                    <h2 className="text-2xl font-bold text-white">{config.careTitle}</h2>
                    {config.careContent.map((paragraph, idx) => (
                        <p key={idx} className="text-sm text-zinc-400 leading-relaxed">{paragraph}</p>
                    ))}
                    <div className="pt-4 flex flex-wrap gap-4 text-sm">
                        <Link href="/sss" className="text-yellow-500 hover:text-yellow-400 font-medium">
                            Sıkça Sorulan Sorular →
                        </Link>
                        <Link href="/custom" className="text-yellow-500 hover:text-yellow-400 font-medium">
                            Özel Tasarım Sipariş →
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
