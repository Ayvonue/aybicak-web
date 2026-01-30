"use client";

import React, { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { formatPrice, normalizeTR, getSizesFromDescription } from "@/lib/utils";
import { Check, Shield, Truck, PenTool } from "lucide-react";
import { motion } from "framer-motion";
import ProductMarquee from "@/components/shared/ProductMarquee";
import { Product } from "@/types";

interface ProductDetailClientProps {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
    const { dispatch } = useCart();
    const [customText, setCustomText] = useState("");
    const [selectedImage, setSelectedImage] = useState(product?.imageUrl || "");
    const [hoveredImage, setHoveredImage] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    // Size Logic
    const availableSizes = React.useMemo(() => {
        if (product?.sizes && product.sizes.length > 0) return product.sizes;
        return getSizesFromDescription(product?.description);
    }, [product]);

    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    // Reset selected image when product changes
    React.useEffect(() => {
        if (product) {
            setSelectedImage(product.imageUrl);
            setImageError(false);
        }
    }, [product]);

    const handleAddToCart = () => {
        if (availableSizes.length > 0 && !selectedSize) return;

        dispatch({
            type: "ADD_ITEM",
            payload: {
                ...product,
                selectedSize: selectedSize || undefined
            }
        });
    };

    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-yellow-100 selection:text-yellow-900">
            <Navbar />

            <div className="pt-32 pb-10 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-square rounded-2xl overflow-hidden bg-[#E5E5E5] bg-[url('/light-metal-bg.png')] bg-cover bg-center border border-white/10 shadow-lg p-4 group"
                        >
                            <Image
                                src={imageError ? "/placeholder-knife.png" : (hoveredImage || selectedImage)}
                                alt={product.name}
                                fill
                                className="object-contain object-center transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                                priority
                                onError={() => setImageError(true)}
                            />
                        </motion.div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x group/thumbs mask-image-gradient">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        onMouseEnter={() => setHoveredImage(img)}
                                        onMouseLeave={() => setHoveredImage(null)}
                                        className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 snap-start bg-[#E5E5E5] border border-white/20 ${(hoveredImage === img || selectedImage === img)
                                            ? "ring-2 ring-yellow-600 shadow-md scale-105 opacity-100"
                                            : "opacity-80 hover:opacity-100 hover:scale-105"
                                            }`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`Görsel ${idx + 1}`}
                                            fill
                                            className="object-cover mix-blend-multiply"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-5"
                    >
                        <div className="border-b border-border pb-4">
                            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 font-sans tracking-tight text-foreground leading-tight">{normalizeTR(product.name)}</h1>
                            <div className="flex items-center gap-4 mb-3">
                                <span className="text-2xl font-bold text-foreground font-sans">{formatPrice(product.price)}</span>
                                {product.isNew && <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-500/30">YENİ</span>}
                            </div>

                            {/* Product Description (Compact) */}
                            <p className="text-zinc-300 text-sm md:text-base leading-snug line-clamp-4">
                                {normalizeTR(product.description || `Geleneksel el işçiliği ile %100 yerli üretim. ${product.steel} çeliğin gücü ve ${product.handle} sap malzemesinin zarafeti bir arada. Uzun yıllar güvenle kullanabileceğiniz bir üründür.`)}
                            </p>
                        </div>

                        {/* Technical Specs Grid (Compact) */}
                        <div className="py-2">
                            <h3 className="text-sm font-bold mb-3 text-foreground font-sans tracking-tight">Teknik Özellikler</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                <SpecItem label="Çelik Tipi" value={product.steel} />
                                <SpecItem label="Sertlik" value={product.hardness} />
                                <SpecItem label="Kabze" value={product.handle} />
                                <SpecItem label="Kategori" value={product.category} />
                                <SpecItem label="Tam Boy" value={product.fullLength} />
                                <SpecItem label="Namlu" value={product.barrelLength} />
                                <SpecItem label="Kalınlık" value={product.thickness} />
                            </div>
                        </div>

                        {/* Size Selection */}
                        {availableSizes.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <h3 className="text-sm font-bold text-foreground font-sans flex items-center justify-between">
                                    Boyut Seçimi
                                    {!selectedSize && <span className="text-red-500 text-xs font-normal">* Zorunlu</span>}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {availableSizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedSize === size
                                                ? "bg-white text-black border-white ring-2 ring-yellow-500/50"
                                                : "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Customization */}
                        <div className="space-y-3 pt-3 border-t border-white/10">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground font-sans">
                                <PenTool className="w-4 h-4 text-yellow-500" />
                                Kişiselleştirme (Lazer Gravür)
                            </h3>
                            <input
                                type="text"
                                placeholder="Buraya yazın (Örn: İsim Soyisim)"
                                className="w-full bg-zinc-800/50 border-2 border-zinc-700 rounded-lg p-3 text-sm text-foreground font-medium focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none transition-all placeholder:text-zinc-500 shadow-sm"
                                value={customText}
                                onChange={(e) => setCustomText(e.target.value)}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4 pt-2">
                            <Button
                                size="lg"
                                className="w-full h-14 text-lg tracking-wide bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleAddToCart}
                                disabled={availableSizes.length > 0 && !selectedSize}
                            >
                                {availableSizes.length > 0 && !selectedSize ? "Lütfen Boyut Seçin" : "Sepete Ekle"}
                            </Button>

                            <a
                                href={`https://wa.me/905555555555?text=Merhaba, şu ürünü sipariş etmek istiyorum: ${product.name} (${typeof window !== 'undefined' ? window.location.href : ''})`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                            >
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full h-12 text-base bg-[#25D366]/10 text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] rounded-xl font-bold transition-all gap-2"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    WhatsApp İle Sipariş Ver
                                </Button>
                            </a>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <FeatureBadge icon={Truck} text="Ücretsiz Kargo" />
                                <FeatureBadge icon={Shield} text="Ömür Boyu Garanti" />
                                <FeatureBadge icon={Check} text="Stokta Hazır" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Related Products Marquee */}
                {relatedProducts.length > 0 && (
                    <section className="mt-20 border-t border-white/5 pt-10">
                        <h2 className="text-2xl font-bold text-foreground mb-6 px-4">Benzer Ürünler</h2>
                        <div className="relative">
                            <ProductMarquee products={relatedProducts} />
                        </div>
                    </section>
                )}
            </div>

            <Footer />
        </main>
    );
}

function SpecItem({ label, value }: { label: string; value: string | undefined }) {
    if (!value || value === "N/A") return null;
    return (
        <div className="bg-zinc-900 border border-white/20 rounded-2xl p-4 flex flex-col gap-1 shadow-lg hover:bg-zinc-800 hover:border-white/30 transition-all duration-300 group">
            <span className="text-zinc-400 group-hover:text-zinc-300 text-xs font-semibold uppercase tracking-wider transition-colors">{label}</span>
            <span className="font-bold text-lg text-white font-sans tracking-wide">{value}</span>
        </div>
    );
}

function FeatureBadge({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
    return (
        <div className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative p-3 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full border border-white/10 group-hover:border-amber-500/30 transition-colors">
                    <Icon className="w-5 h-5 text-amber-500" />
                </div>
            </div>
            <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors text-center leading-tight">{text}</span>
        </div>
    );
}
