"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("aybicak-cookie-consent");
        if (!consent) {
            // Show after a small delay
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("aybicak-cookie-consent", "accepted");
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem("aybicak-cookie-consent", "declined");
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
                >
                    <div className="max-w-7xl mx-auto bg-[#18181B]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6 md:flex items-center justify-between gap-8 relative overflow-hidden">
                        {/* Glow Effect */}
                        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 bg-yellow-600/10 rounded-full blur-[50px] pointer-events-none" />

                        <div className="flex items-start gap-4 flex-1 relative z-10">
                            <div className="bg-yellow-600/20 p-3 rounded-xl hidden md:block">
                                <Cookie className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-white font-bold">Çerez Tercihleri</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Alışveriş deneyiminizi iyileştirmek ve hizmetlerimizi sunabilmek için çerezleri kullanıyoruz.
                                    Detaylı bilgiye <Link href="/legal/privacy" className="text-white underline hover:text-yellow-500">Gizlilik Politikamızdan</Link> ulaşabilirsiniz.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6 md:mt-0 relative z-10">
                            <Button
                                variant="outline"
                                onClick={handleDecline}
                                className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                            >
                                Reddet
                            </Button>
                            <Button
                                variant="premium"
                                onClick={handleAccept}
                                className="bg-white text-black hover:bg-zinc-200 border-none px-6"
                            >
                                Kabul Et
                            </Button>
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
