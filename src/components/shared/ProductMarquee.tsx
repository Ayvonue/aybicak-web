"use client";

import { useEffect, useRef } from "react";
import KnifeCard from "./KnifeCard";
import { Product } from "@/types";

interface ProductMarqueeProps {
    products: Product[];
}

// Otomatik kayma hızı (saniyede piksel) — yavaş, premium his
const SPEED = 22;

const MarqueeRow = ({ products, reverse = false }: { products: Product[]; reverse?: boolean }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    // Kullanıcı parmakla/fareyle etkileşimdeyken otomatik kaymayı duraklat
    const interactingRef = useRef(false);
    const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Kesintisiz döngü için ürünler 2 kez çoğaltılır
    const items = [...products, ...products];

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        // Ters yöndeki satır, sola kaydırabilmek için ortadan başlar
        if (reverse) {
            el.scrollLeft = el.scrollWidth / 2;
        }

        const reduceMotion = typeof window !== "undefined"
            && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let raf = 0;
        let last = performance.now();

        const tick = (now: number) => {
            const dt = (now - last) / 1000;
            last = now;
            const half = el.scrollWidth / 2;

            if (half > 0 && !interactingRef.current) {
                if (!reduceMotion) {
                    el.scrollLeft += (reverse ? -1 : 1) * SPEED * dt;
                }
                // Sona gelince başa sar (iki set aynı olduğu için kesintisiz)
                if (el.scrollLeft >= half) el.scrollLeft -= half;
                else if (el.scrollLeft <= 0) el.scrollLeft += half;
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(raf);
    }, [reverse]);

    const pause = () => {
        interactingRef.current = true;
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };

    const resume = () => {
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
        // Parmak kaldırıldıktan sonra momentum kayması bitsin diye kısa gecikme
        resumeTimer.current = setTimeout(() => {
            interactingRef.current = false;
        }, 1500);
    };

    return (
        <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 px-3 overflow-x-auto scrollbar-hide select-none overscroll-x-contain [touch-action:pan-x] cursor-grab active:cursor-grabbing"
            onPointerDown={pause}
            onPointerUp={resume}
            onPointerCancel={resume}
            onMouseEnter={pause}
            onMouseLeave={resume}
            onTouchStart={pause}
            onTouchEnd={resume}
        >
            {items.map((product, idx) => (
                <div
                    key={`${product.id}-${idx}`}
                    className="w-[150px] sm:w-[207px] shrink-0 transition-transform duration-500 hover:scale-105 hover:z-10 opacity-90 hover:opacity-100"
                >
                    <KnifeCard {...product} optimized={true} />
                </div>
            ))}
        </div>
    );
};

export default function ProductMarquee({ products }: ProductMarqueeProps) {
    const limit = 15;
    const row1 = products.slice(0, limit);
    const row2 = products.slice(limit, limit * 2);
    const row3 = products.slice(limit * 2, limit * 3);

    return (
        <div className="w-full py-10 space-y-8 relative overflow-hidden bg-background">
            {/* Gradient Masks (kaydırmayı engellemez) */}
            <div className="absolute top-0 left-0 w-16 sm:w-40 h-full z-20 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-16 sm:w-40 h-full z-20 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none" />

            {/* Row 1 */}
            <div className="transform -rotate-1 relative z-10 py-2">
                <MarqueeRow products={row1.length > 0 ? row1 : products.slice(0, 10)} />
            </div>

            {/* Row 2 (Reverse) */}
            <div className="transform rotate-1 scale-105 z-0 opacity-80 hover:opacity-100 transition-opacity">
                <MarqueeRow products={row2.length > 0 ? row2 : products.slice(0, 10)} reverse />
            </div>

            {/* Row 3 */}
            <div className="transform -rotate-1 relative z-10 py-2">
                <MarqueeRow products={row3.length > 0 ? row3 : products.slice(0, 10)} />
            </div>
        </div>
    );
}
