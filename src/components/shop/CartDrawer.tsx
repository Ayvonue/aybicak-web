"use client";

import React, { useState, useEffect } from "react";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/shared/AuthModal";

export default function CartDrawer() {
    const { state, dispatch } = useCart();
    const { user } = useAuth();
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const closeCart = () => dispatch({ type: "TOGGLE_CART" });

    return (
        <AnimatePresence>
            {state.isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-md flex flex-col glass-panel-dark border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 backdrop-blur-xl">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-sans tracking-wide">
                                <ShoppingBag className="w-5 h-5 text-yellow-600" />
                                Sepetim <span className="text-zinc-500 font-normal text-sm">({state.items.length} ürün)</span>
                            </h2>
                            <button
                                onClick={closeCart}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white group"
                            >
                                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {state.items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-6">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                                        <ShoppingBag className="w-8 h-8 opacity-50" />
                                    </div>
                                    <p className="font-medium text-lg">Sepetiniz şu an boş.</p>
                                    <Button variant="outline" onClick={closeCart} className="border-white/20 text-white hover:bg-white/10">
                                        Alışverişe Başla
                                    </Button>
                                </div>
                            ) : (
                                state.items.map((item) => (
                                    <motion.div
                                        layout
                                        key={`${item.id}-${item.selectedSize}`}
                                        className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group"
                                    >
                                        <div className="relative w-24 h-24 bg-white rounded-lg overflow-hidden border border-white/10 shadow-inner flex-shrink-0">
                                            <CartItemImage src={item.imageUrl} alt={item.name} />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="space-y-1">
                                                    <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                                                        {item.name}
                                                    </h3>
                                                    {item.selectedSize && (
                                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 uppercase tracking-wider font-bold">
                                                            {item.selectedSize}
                                                        </span>
                                                    )}
                                                    <p className="text-xs text-zinc-300">{item.steel}</p>
                                                </div>
                                                <button
                                                    onClick={() => dispatch({ type: "REMOVE_ITEM", payload: { id: item.id, selectedSize: item.selectedSize } })}
                                                    className="text-zinc-400 hover:text-red-400 transition-colors p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between pt-3">
                                                <span className="font-bold text-white tracking-tight">{formatPrice(item.price)}</span>
                                                <div className="flex items-center gap-3 bg-white/10 rounded-lg px-2 py-1 border border-white/5">
                                                    <button
                                                        onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, selectedSize: item.selectedSize, quantity: item.quantity - 1 } })}
                                                        className="text-zinc-300 hover:text-white transition-colors w-6 h-6 flex items-center justify-center border-r border-white/10 disabled:opacity-30"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-sm w-4 text-center font-medium text-white">{item.quantity}</span>
                                                    <button
                                                        onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, selectedSize: item.selectedSize, quantity: item.quantity + 1 } })}
                                                        className="text-zinc-300 hover:text-white transition-colors w-6 h-6 flex items-center justify-center border-l border-white/10"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {state.items.length > 0 && (
                            <div className="p-6 border-t border-white/10 bg-zinc-900/95 backdrop-blur-xl space-y-4">
                                {/* Member Discount Teaser */}
                                {!user && (
                                    <div
                                        className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 cursor-pointer hover:border-yellow-500/50 transition-colors group"
                                        onClick={() => setIsRegisterOpen(true)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold">
                                                %5
                                            </div>
                                            <div>
                                                <h4 className="text-yellow-500 font-bold text-sm group-hover:underline">Ekstra İndirim Kazan</h4>
                                                <p className="text-zinc-400 text-xs">Hemen üye ol, sepet tutarından %5 düşsün.</p>
                                            </div>
                                            <div className="ml-auto">
                                                <Button size="sm" variant="outline" className="h-8 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-black">
                                                    Üye Ol
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-zinc-300">
                                        <span>Ara Toplam</span>
                                        <span className="text-white font-medium">{formatPrice(state.total)}</span>
                                    </div>

                                    {/* Discount Row */}
                                    {state.discount > 0 && (
                                        <div className="flex justify-between text-yellow-500">
                                            <span>Üye İndirimi (%5)</span>
                                            <span className="font-medium">-{formatPrice(state.discount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-zinc-300">
                                        <span>Kargo</span>
                                        <span className="text-green-400 font-medium flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Ücretsiz
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10">
                                        <span>Toplam</span>
                                        <span className="text-yellow-500">{formatPrice(state.finalTotal || state.total)}</span>
                                    </div>
                                </div>
                                <Link href="/checkout" onClick={closeCart} className="block group">
                                    <Button variant="premium" className="w-full h-14 text-lg font-bold text-white shadow-lg shadow-yellow-900/20 group-hover:shadow-yellow-600/30 transition-all flex items-center justify-center gap-2">
                                        Ödemeye Geç
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <p className="text-center text-[10px] text-zinc-400 uppercase tracking-widest">Güvenli Ödeme Altyapısı</p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
            {/* <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} /> */}
            <AuthModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} initialTab="register" />
        </AnimatePresence>
    );
}

function CartItemImage({ src, alt }: { src: string; alt: string }) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    return (
        <Image
            src={hasError ? "/placeholder-knife.png" : imgSrc}
            alt={alt}
            fill
            className="object-contain p-2"
            onError={() => setHasError(true)}
        />
    );
}
