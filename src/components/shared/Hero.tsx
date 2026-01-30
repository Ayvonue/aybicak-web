"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Truck, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

const SLIDES = [
    {
        id: 1,
        image: "/hero-v2.png",
        title: <>Kaliteli Bıçak, <br /><span className="text-slate-400">Uygun Fiyat.</span></>,
        subtitle: "Fabrika değil, usta eli. 30 yıllık tecrübe ile üretilen el yapımı bıçaklar. ₺500'den başlayan fiyatlar.",
        buttonText: "Koleksiyonu Gör",
        link: "/shop",
        isDarkOverlay: true
    },
    {
        id: 2,
        image: "/slide-kurban.png", // New HQ generated image
        title: <>Kurban Bayramına <br /><span className="text-yellow-500">Hazır Mısınız?</span></>,
        subtitle: "Profesyonel kasap ve mutfak bıçakları ile işinizi şansa bırakmayın. En keskin setler şimdi stokta.",
        buttonText: "Kurban Bıçakları",
        link: "/shop?category=Set/Mutfak",
        isDarkOverlay: true
    },
    {
        id: 3,
        image: "/slide-hunting.png", // New HQ generated image
        title: <>Doğadaki En Güçlü <br /><span className="text-emerald-500">Dostunuz.</span></>,
        subtitle: "Zorlu şartlara dayanıklı, el yapımı av ve kamp bıçakları. Doğada sizi asla yarı yolda bırakmaz.",
        buttonText: "Av Bıçakları",
        link: "/shop?category=Kamp%20Bıçağı",
        isDarkOverlay: true
    }
];

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 6000); // 6 seconds per slide
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative h-[85svh] min-h-[500px] md:h-[80vh] md:min-h-[600px] w-full flex justify-center items-center py-4 md:py-10">
            {/* Main Content Container - Boxed & Centered */}
            <div className="relative w-full max-w-[1400px] h-full mx-auto overflow-hidden group">

                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.05 }} // Slight zoom effect start
                        animate={{ opacity: 1, scale: 1 }} // Smooth settle
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }} // Slower, smoother transition
                        className="absolute inset-0 z-0 bg-transparent will-change-transform"
                    >
                        {/* No internal texture - letting global background show or stay clean */}

                        {/* Stronger Vignette */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_95%)] opacity-70" />

                        <Image
                            src={SLIDES[currentSlide].image}
                            alt="Hero Slide"
                            fill
                            priority={true}
                            quality={90}
                            className="object-contain object-center opacity-90"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent ${SLIDES[currentSlide].isDarkOverlay ? "bg-black/20" : ""}`} />
                    </motion.div>
                </AnimatePresence>

                {/* Content */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="max-w-4xl space-y-6"
                        >
                            <p className="text-sm text-yellow-500 uppercase tracking-[0.3em] font-bold drop-shadow-md">
                                El Yapımı Bıçak Koleksiyonu
                            </p>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-tight drop-shadow-2xl">
                                {SLIDES[currentSlide].title}
                            </h1>

                            <p className="text-lg md:text-xl text-zinc-300 max-w-xl mx-auto leading-relaxed drop-shadow-lg font-medium">
                                {SLIDES[currentSlide].subtitle}
                            </p>

                            <div className="pt-8">
                                <Link href={SLIDES[currentSlide].link}>
                                    <Button size="lg" className="rounded-full bg-white text-black hover:bg-zinc-200 hover:scale-105 transition-all font-bold px-10 h-14 text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                                        {SLIDES[currentSlide].buttonText}
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Dots Navigation */}
                <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-4">
                    {SLIDES.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`group relative flex items-center justify-center p-2 transition-all duration-300`}
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <span className={`block rounded-full transition-all duration-500 ease-out 
                                ${currentSlide === index ? "w-12 h-1.5 bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.8)]" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/70"}`}
                            />
                        </button>
                    ))}
                </div>

                {/* Bottom Features (Static Overlay) */}
                <div className="absolute bottom-6 left-0 right-0 hidden md:flex justify-between px-10 pointer-events-none opacity-50">
                </div>
            </div>
        </section>
    );
}
