"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Eye, Heart, Truck, PenTool } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn, formatPrice, normalizeTR } from "@/lib/utils";
import { useFavorites } from "@/context/FavoritesContext";

interface KnifeCardProps {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    steel: string;
    isNew?: boolean;
    optimized?: boolean;
    priority?: boolean;
}

export default function KnifeCard({ id, name, price, imageUrl, steel, isNew, optimized = false, priority = false }: KnifeCardProps) {
    const router = useRouter();
    const { isFavorite, dispatch: favDispatch } = useFavorites();
    const [imgSrc, setImgSrc] = useState(imageUrl || "/placeholder-knife.png");

    useEffect(() => {
        setImgSrc(imageUrl || "/placeholder-knife.png");
    }, [imageUrl]);

    const handleCardClick = () => {
        router.push(`/product/${id}`);
    };

    return (
        <motion.div
            className="group relative bg-[#E5E5E5] bg-[url('/light-metal-bg.png')] bg-cover bg-center rounded-xl overflow-hidden border border-white/20 shadow-sm hover:shadow-2xl hover:border-accent/50 transition-all cursor-pointer"
            onClick={handleCardClick}
            initial={optimized ? undefined : { opacity: 0, y: 20 }} // Disable initial animation for marquee to save frame
            animate={optimized ? undefined : { opacity: 1, y: 0 }}
            whileHover={optimized ? { y: -5 } : { y: -10 }} // Simpler hover for marquee
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-transparent">
                {imgSrc ? (
                    <div className="relative w-full h-full p-6">
                        <Image
                            src={imgSrc}
                            alt={name}
                            fill
                            sizes={optimized ? "500px" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                            quality={100}
                            unoptimized
                            priority={priority}
                            className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-110 mix-blend-multiply"
                            onError={() => setImgSrc("/placeholder-knife.png")}
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <span className="text-xs">Görsel Yok</span>
                    </div>
                )}
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {isNew && <span className="bg-[#C5A028] text-white text-[10px] font-bold px-2 py-1 rounded shadow-md tracking-wide">YENİ</span>}
                    {/* Discount Badge */}
                    {!isNew && (
                        <span className="bg-[#8B0000] text-white text-[10px] font-bold px-2 py-1 rounded shadow-md tracking-wide">%20 FIRSAT</span>
                    )}
                    <span className={cn(
                        "text-zinc-900 text-[10px] font-bold px-2 py-1 rounded border border-white/30 shadow-sm",
                        optimized ? "bg-white" : "bg-white"
                    )}>{steel}</span>
                </div>

                {/* Apple-Style Sales Hook (Minimal Glass Pill) */}
                {/* Apple-Style Sales Hook (Minimal Glass Pill) */}
                <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20">
                    <div className="bg-white shadow-[0_8px_16px_rgba(0,0,0,0.2)] border border-zinc-100 rounded-full py-2 px-4 flex items-center justify-center gap-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-700 tracking-wide">
                            <Truck className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                            <span>Kargo Bedava</span>
                        </div>
                        <div className="w-px h-3 bg-zinc-200"></div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-700 tracking-wide">
                            <PenTool className="w-3.5 h-3.5 text-indigo-600" strokeWidth={2.5} />
                            <span>Lazer Baskı</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions (Hover) */}
                <div className={cn(
                    "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300",
                    isFavorite(id)
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                )}>
                    <button
                        className={cn(
                            "p-2 shadow-md rounded-full transition-all",
                            isFavorite(id)
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-white/80 hover:bg-white text-zinc-800"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            favDispatch({ type: "TOGGLE_FAVORITE", payload: id });
                        }}
                        title={isFavorite(id) ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                    >
                        <Heart className={cn("w-4 h-4", isFavorite(id) && "fill-current")} />
                    </button>
                    <button
                        className="p-2 bg-white/80 hover:bg-white shadow-md rounded-full text-zinc-800 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className={cn(
                "p-4 space-y-2 relative z-10 border-t border-white/5", // Subtle separator
                "bg-transparent" // Fully transparent to show same metal layout as top
            )}>
                <h3 className="text-zinc-900 font-bold text-base leading-snug line-clamp-2 min-h-[3rem]" title={name}>
                    {normalizeTR(name)}
                </h3>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200/50">
                    <div className="flex flex-col">
                        <span className="text-[11px] text-zinc-500 line-through font-medium">{formatPrice(price * 1.25)}</span>
                        <div className="text-zinc-900 font-black text-lg font-sans tracking-tight leading-none">
                            {formatPrice(price)}
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="default"
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-zinc-900 hover:bg-zinc-100 shadow-lg btn-glint font-medium tracking-wide h-8 text-xs px-3"
                    >
                        <ShoppingBag className="w-3 h-3 mr-1.5" />
                        İncele
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
