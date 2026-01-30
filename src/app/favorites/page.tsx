"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { useFavorites } from "@/context/FavoritesContext";
import { products } from "@/data/products";
import KnifeCard from "@/components/shared/KnifeCard";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
    const { state } = useFavorites();
    const favoriteProducts = products.filter(p => state.items.includes(p.id));

    return (
        <main className="min-h-screen bg-black text-foreground">
            <div className="fixed inset-0 bg-neutral-950 z-[-1]" />
            <div className="fixed inset-0 bg-[url('/noise.png')] opacity-20 z-[-1] pointer-events-none mix-blend-overlay" />

            <Navbar />

            <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
                <div className="flex items-center gap-4 mb-10 pb-4 border-b border-white/10">
                    <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                        <Heart className="w-6 h-6 text-red-500 fill-current" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Favorilerim</h1>
                    <span className="text-zinc-500 text-lg">({favoriteProducts.length})</span>
                </div>

                {favoriteProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteProducts.map((product) => (
                            <KnifeCard
                                key={product.id}
                                {...product}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-sm">
                        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Listeniz Henüz Boş</h2>
                        <p className="text-zinc-400 max-w-md mx-auto mb-8">
                            Beğendiğiniz ürünleri kalp ikonuna tıklayarak buraya ekleyebilir, daha sonra kolayca ulaşabilirsiniz.
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
                        >
                            Koleksiyonu Keşfet
                        </Link>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
