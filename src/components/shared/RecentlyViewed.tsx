"use client";

import { useEffect, useState } from "react";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import { products } from "@/data/products";
import KnifeCard from "@/components/shared/KnifeCard";
import { Clock } from "lucide-react";
import type { Product } from "@/types";

// Son görüntülenen ürünleri yatay listede gösterir. excludeId, açık olan
// ürün sayfasındaki ürünü listeden çıkarır.
export default function RecentlyViewed({ excludeId, title = "Son Gezdikleriniz" }: { excludeId?: string; title?: string }) {
    const [items, setItems] = useState<Product[]>([]);

    // localStorage yalnızca istemcide var; hydration uyuşmazlığını önlemek için
    // mount sonrası okunur (önce boş render, sonra doldur).
    useEffect(() => {
        const ids = getRecentlyViewed().filter((id) => id !== excludeId);
        const resolved = ids
            .map((id) => products.find((p) => p.id === id))
            .filter((p): p is Product => Boolean(p))
            .slice(0, 6);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(resolved);
    }, [excludeId]);

    if (items.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-white/5">
            <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white mb-6">
                <Clock className="w-5 h-5 text-yellow-500" />
                {title}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {items.map((product) => (
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
    );
}
