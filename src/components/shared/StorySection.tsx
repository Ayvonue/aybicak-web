"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

export default function StorySection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });

    const yBackground = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
    const opacityContent = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]);

    return (
        <section ref={sectionRef} className="relative h-[200vh] bg-black overflow-hidden">
            {/* Parallax Background */}
            <motion.div
                style={{ y: yBackground }}
                className="absolute inset-0 z-0 opacity-40"
            >
                {/* Placeholder for a forge/crafting video or image */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
                <Image
                    src="/titanium_texture.png" // Fallback to texture if no image
                    alt="Forging"
                    fill
                    className="object-cover"
                />
            </motion.div>

            {/* Scrollytelling Content 1 */}
            <div className="sticky top-0 h-screen flex items-center justify-center z-10 px-6">
                <motion.div
                    style={{ opacity: opacityContent }}
                    className="max-w-4xl text-center space-y-8"
                >
                    <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase">Miras</p>
                    <h2 className="text-5xl md:text-8xl font-black text-white leading-tight">
                        Ateşten Doğan <br />
                        <span className="text-zinc-500">Mükemmellik.</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-2xl mx-auto">
                        Her Ay Bıçak, 1200 derecelik fırınlarda şekillenir.
                        Çeliğin ruhu, ustanın ellerinde hayat bulur.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
