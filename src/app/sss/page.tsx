"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Truck, Shield, CreditCard, Package, Phone, Mail } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { siteConfig } from "@/lib/site";
import { faqCategories } from "@/data/faq";

// Kategori ikonları faq.ts'teki sırayla eşleşir
const categoryIcons = [CreditCard, Truck, Shield, Package];

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/10 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-5 flex items-center justify-between text-left group"
            >
                <span className="text-white font-medium pr-4 group-hover:text-yellow-500 transition-colors">
                    {question}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                >
                    <ChevronDown className="w-5 h-5 text-zinc-400" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-5 text-zinc-400 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function SSKPage() {
    const [activeCategory, setActiveCategory] = useState(0);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-16 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-6">
                        <HelpCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-500 font-medium">Yardım Merkezi</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Sıkça Sorulan Sorular</h1>
                    <p className="text-xl text-zinc-400">
                        Merak ettiğiniz tüm soruların yanıtlarını burada bulabilirsiniz.
                    </p>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="pb-20">
                <div className="max-w-5xl mx-auto px-6">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-3 justify-center mb-12">
                        {faqCategories.map((cat, idx) => {
                            const Icon = categoryIcons[idx] ?? HelpCircle;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActiveCategory(idx)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${activeCategory === idx
                                            ? "bg-yellow-500 text-black"
                                            : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {cat.title}
                                </button>
                            );
                        })}
                    </div>

                    {/* Questions */}
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            {(() => {
                                const Icon = categoryIcons[activeCategory] ?? HelpCircle;
                                return <Icon className="w-6 h-6 text-yellow-500" />;
                            })()}
                            <h2 className="text-2xl font-bold">{faqCategories[activeCategory].title}</h2>
                        </div>
                        <div>
                            {faqCategories[activeCategory].questions.map((item, idx) => (
                                <FAQItem key={idx} question={item.q} answer={item.a} />
                            ))}
                        </div>
                    </motion.div>

                    {/* Contact CTA */}
                    <div className="mt-16 text-center">
                        <p className="text-zinc-400 mb-6">Aradığınız cevabı bulamadınız mı?</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href={siteConfig.phoneHref}
                                className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-zinc-200 transition-colors"
                            >
                                <Phone className="w-5 h-5" />
                                Bizi Arayın
                            </a>
                            <a
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                <Mail className="w-5 h-5" />
                                İletişim Formu
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
