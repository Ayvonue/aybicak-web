"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/utils";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(products.slice(0, 6));
    const [mounted, setMounted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.trim() === "") {
            setResults(products.slice(0, 6));
        } else {
            const filtered = products.filter((p) =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.category?.toLowerCase().includes(query.toLowerCase()) ||
                p.steel?.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 8);
            setResults(filtered);
        }
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0" style={{ zIndex: 99999 }}>
                    {/* Backdrop - yarı şeffaf */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal Wrapper - tıklayınca kapat */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        onClick={onClose}
                        className="absolute top-20 left-0 right-0 bottom-0 flex justify-center items-start px-4 pt-0"
                    >
                        {/* Modal Content - içeride tıklama yayılmasın */}
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Search Input */}
                            <div className="flex items-center gap-4 p-4 border-b border-zinc-800 bg-zinc-800/50">
                                <Search className="w-5 h-5 text-zinc-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Ürün ara... (örn: av bıçağı, n690, kamp)"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="flex-1 bg-transparent text-white text-lg placeholder:text-zinc-500 outline-none"
                                />
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-zinc-400" />
                                </button>
                            </div>

                            {/* Results */}
                            <div className="max-h-[60vh] overflow-y-auto p-2">
                                {results.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-500">
                                        <p>Sonuç bulunamadı</p>
                                        <p className="text-sm mt-1">Farklı bir arama terimi deneyin</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {results.map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/product/${product.id}`}
                                                onClick={onClose}
                                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800 transition-colors group"
                                            >
                                                <div className="relative w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                                                    <Image
                                                        src={product.imageUrl || "/placeholder-knife.png"}
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain p-1"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-medium truncate group-hover:text-slate-300 transition-colors">
                                                        {product.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-zinc-500">{product.steel}</span>
                                                        <span className="text-zinc-600">•</span>
                                                        <span className="text-xs text-zinc-500">{product.category}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-white font-bold">{formatPrice(product.price)}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 bg-zinc-800/30">
                                <span>{results.length} ürün bulundu</span>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-zinc-700 rounded text-zinc-400">ESC</kbd>
                                    <span>kapatmak için</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
