"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import KnifeCard from "@/components/shared/KnifeCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { useKnifeFilter } from "@/hooks/useKnifeFilter";
import { products } from "@/data/products";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

export default function ShopPage() {
    const { filteredProducts, filters, updateFilter, clearFilters } = useKnifeFilter(products);
    const [sortOrder, setSortOrder] = useState<string>("default");

    // Extract unique values for filters - Memoized
    const { steels, handles, categories } = useMemo(() => {
        const uniqueSteels = Array.from(new Set(products.map((p) => p.steel)));
        const uniqueHandles = Array.from(new Set(products.map((p) => p.handle)));
        const uniqueCategories = Array.from(new Set(products.map((p) => p.category))).filter((c) => c && c !== "N/A");
        return { steels: uniqueSteels, handles: uniqueHandles, categories: uniqueCategories };
    }, []);

    const sortedProducts = useMemo(() => {
        return [...filteredProducts].sort((a, b) => {
            if (sortOrder === "price-asc") return a.price - b.price;
            if (sortOrder === "price-desc") return b.price - a.price;
            return 0; // Default
        });
    }, [filteredProducts, sortOrder]);

    return (
        <main className="min-h-screen bg-black text-foreground selection:bg-yellow-600 selection:text-white">
            <div className="fixed inset-0 bg-neutral-950 z-[-1]" />
            <div className="fixed inset-0 bg-[url('/noise.png')] opacity-20 z-[-1] pointer-events-none mix-blend-overlay" />
            <Navbar />

            {/* Shop Header */}
            <div className="relative w-full h-[40vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black z-10" />
                <div className="absolute inset-0 bg-[url('/hero-v2.png')] bg-cover bg-center opacity-40 grayscale blur-sm scale-110" />

                <div className="relative z-20 text-center space-y-4 mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md"
                    >
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-emerald-400">Canlı Stok</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-2xl"
                    >
                        Koleksiyon
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 max-w-lg mx-auto text-lg"
                    >
                        Yatağan'ın efsanevi çeliği, modern tasarım ile buluştu.
                    </motion.p>
                </div>
            </div>

            <div className="pb-20 max-w-[1600px] mx-auto px-6 -mt-10 relative z-30">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <FilterSidebar
                        filters={filters}
                        updateFilter={updateFilter}
                        clearFilters={clearFilters}
                        steels={steels}
                        handles={handles}
                        categories={categories}
                    />

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6 bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-md">
                            <span className="text-zinc-400 text-sm font-medium flex items-center gap-2">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                                {sortedProducts.length} ürün listeleniyor
                            </span>
                            <select
                                className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:border-yellow-600 outline-none hover:bg-white/5 transition-all cursor-pointer appearance-none"
                                onChange={(e) => setSortOrder(e.target.value)}
                                value={sortOrder}
                            >
                                <option value="default">Varsayılan Sıralama</option>
                                <option value="price-asc">Fiyat: Artan</option>
                                <option value="price-desc">Fiyat: Azalan</option>
                            </select>
                        </div>

                        {sortedProducts.length > 0 ? (
                            <div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                id="product-grid"
                            >
                                {sortedProducts.map((product, index) => (
                                    <div key={product.id}>
                                        <KnifeCard
                                            id={product.id}
                                            name={product.name}
                                            price={product.price}
                                            imageUrl={product.imageUrl}
                                            steel={product.steel}
                                            isNew={product.isNew}
                                            priority={index < 6}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
                                    <span className="text-3xl">🔍</span>
                                </div>
                                <p className="text-lg font-medium text-foreground">Aradığınız kriterlere uygun ürün bulunamadı.</p>
                                <button
                                    onClick={clearFilters}
                                    className="text-yellow-600 font-bold hover:underline underline-offset-4"
                                >
                                    Filtreleri Temizle
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main >
    );
}
