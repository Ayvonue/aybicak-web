"use client";

import { motion } from "framer-motion";
import KnifeCard from "./KnifeCard";
import { Product } from "@/types";

interface ProductMarqueeProps {
    products: Product[];
}

const MARQUEE_SPEED = 180; // Seconds for full rotation (Very Slow)

const MarqueeRow = ({ products, reverse = false }: { products: Product[], reverse?: boolean }) => {
    // Optimization: Reduced duplication to 3x (Safe for standard screens, lightweight)
    const duplicatedProducts = [...products, ...products, ...products];

    return (
        <div className="flex overflow-hidden select-none translate-z-0">
            <motion.div
                className="flex gap-4 px-3 will-change-transform backface-hidden"
                initial={{ x: reverse ? "-33.33%" : "0%" }}
                animate={{ x: reverse ? "0%" : "-33.33%" }} // Move by 1 set length (1/3 of total)
                transition={{
                    ease: "linear",
                    duration: MARQUEE_SPEED,
                    repeat: Infinity,
                }}
                whileHover={{ animationPlayState: "paused" }}
                style={{
                    display: "flex",
                    width: "fit-content",
                    transform: "translate3d(0,0,0)",
                    perspective: 1000
                }}
            >
                {duplicatedProducts.map((product, idx) => (
                    <div
                        key={`${product.id}-${idx}`}
                        className="w-[207px] shrink-0 transform-gpu transition-transform duration-500 hover:scale-105 hover:z-10 hover:shadow-2xl opacity-90 hover:opacity-100"
                    >
                        <KnifeCard {...product} optimized={true} />
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default function ProductMarquee({ products }: ProductMarqueeProps) {
    // Optimization: Limit to first 45 items to simple spread across 3 rows
    const limit = 15;
    const row1 = products.slice(0, limit);
    const row2 = products.slice(limit, limit * 2);
    const row3 = products.slice(limit * 2, limit * 3);

    return (
        <div className="w-full py-10 space-y-8 relative overflow-hidden bg-background">
            {/* Gradient Masks */}
            <div className="absolute top-0 left-0 w-40 h-full z-20 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-40 h-full z-20 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none" />

            {/* Row 1 */}
            <div className="transform -rotate-1 relative z-10 glass-panel-dark/5 py-2">
                <MarqueeRow products={row1.length > 0 ? row1 : products.slice(0, 10)} />
            </div>

            {/* Row 2 (Reverse) */}
            <div className="transform rotate-1 scale-105 z-0 opacity-80 hover:opacity-100 transition-opacity">
                <MarqueeRow products={row2.length > 0 ? row2 : products.slice(0, 10)} reverse />
            </div>

            {/* Row 3 */}
            <div className="transform -rotate-1 relative z-10 glass-panel-dark/5 py-2">
                <MarqueeRow products={row3.length > 0 ? row3 : products.slice(0, 10)} />
            </div>
        </div>
    );
}
