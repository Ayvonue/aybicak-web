"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
            {/* Background Effect */}
            <div className="fixed inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-red-500/5 pointer-events-none" />

            <div className="text-center relative z-10 max-w-lg">
                {/* 404 Number */}
                <div className="relative mb-8">
                    <h1 className="text-[150px] md:text-[200px] font-bold text-white/5 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl" />
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-2xl md:text-3xl font-bold mb-4 -mt-16">
                    Sayfa Bulunamadı
                </h2>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                    Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Ana Sayfaya Dön
                    </Link>
                    <Link
                        href="/shop"
                        className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
                    >
                        <Search className="w-5 h-5" />
                        Mağazayı Keşfet
                    </Link>
                </div>

                {/* Back Link */}
                <button
                    onClick={() => typeof window !== 'undefined' && window.history.back()}
                    className="mt-8 inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Önceki sayfaya dön
                </button>

                {/* Decorative Knife */}
                <div className="mt-16 opacity-20">
                    <svg width="120" height="24" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                        <path d="M0 12L100 12M100 12L85 4M100 12L85 20M100 12L120 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </main>
    );
}
