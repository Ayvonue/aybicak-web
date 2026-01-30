"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Button } from "@/components/ui/Button";
import { Send, PenTool, Hammer, Crown, Sparkles, Gem, Leaf, Flame, Shield, ArrowRight, CreditCard, MessageCircle, Tag } from "lucide-react";
import { motion } from "framer-motion";

export default function CustomPage() {
    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-yellow-600 selection:text-white">
            <Navbar />

            {/* Typographic Hero */}
            <section className="pt-48 pb-32 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-yellow-600/5 blur-[120px] rounded-full -z-10" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <h1 className="text-6xl md:text-8xl font-black font-serif tracking-tight text-foreground mb-4">
                        SİZE ÖZEL <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-700 via-yellow-800 to-yellow-950 italic pr-2">
                            TASARIM
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed border-t border-border pt-8 font-serif italic">
                        "Hayalinizdeki bıçağı, bütçenize uygun şekilde tasarlayalım."
                    </p>

                    {/* Affordability Badges */}
                    <div className="flex flex-wrap justify-center gap-4 pt-6">
                        <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/30 rounded-full">
                            <Tag className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">₺300'den</span>
                            <span className="text-zinc-400">başlayan fiyatlar</span>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-3 bg-zinc-800/50 border border-white/10 rounded-full text-zinc-300">
                            <CreditCard className="w-4 h-4 text-amber-400" />
                            <span>Taksit imkanı</span>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-3 bg-zinc-800/50 border border-white/10 rounded-full text-zinc-300">
                            <MessageCircle className="w-4 h-4 text-amber-400" />
                            <span>Bütçenize göre öneri</span>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* The Process - Minimalist Timeline */}
            <section className="py-24 px-6 max-w-5xl mx-auto">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-sm font-bold tracking-[0.2em] text-yellow-800 uppercase border-b-2 border-yellow-800/20 inline-block pb-1">Süreç Nasıl İşler?</h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-foreground font-serif">Hayalden Gerçeğe 4 Adım</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[60px] left-0 right-0 h-[1px] bg-border -z-10" />

                    {[
                        { icon: PenTool, title: "1. Tasarım", desc: "Kullanım amacınıza göre profil ve ergonomi belirlenir." },
                        { icon: Gem, title: "2. Materyal", desc: "Dünyanın en iyi çelikleri ve kabza malzemeleri seçilir." },
                        { icon: Flame, title: "3. Ateş ve Su", desc: "Isıl işlem ile çeliğe ruhu ve sertliği kazandırılır." },
                        { icon: Crown, title: "4. Teslimat", desc: "Kusursuz polisaj, deri kılıf ve özel kutu ile sunum." }
                    ].map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="w-[120px] h-[120px] bg-background border border-border rounded-full flex items-center justify-center mb-6 relative group-hover:border-yellow-600/50 transition-colors shadow-sm">
                                <div className="absolute inset-2 rounded-full border border-dashed border-border group-hover:animate-spin-slow" />
                                <step.icon className="w-10 h-10 text-foreground group-hover:text-yellow-600 transition-colors" strokeWidth={1.5} />
                            </div>
                            <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed px-4">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Customization Options - Dark Theme */}
            <section className="py-32 px-6 bg-zinc-900/50 border-y border-white/10">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold tracking-[0.2em] text-amber-500 uppercase">Özelleştirme</h2>
                            <h3 className="text-4xl font-bold text-white">Sınırsız Seçenekler</h3>
                        </div>
                        <p className="text-zinc-400 max-w-md text-right md:text-left">
                            Bıçağınızın her detayına siz karar verin. Standartların ötesine geçin.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Steel Card */}
                        <div className="bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Shield className="w-32 h-32 text-white" />
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-xl flex items-center justify-center mb-6">
                                <Hammer className="w-6 h-6 text-amber-500" />
                            </div>
                            <h4 className="text-2xl font-bold mb-4 text-white">Çelik Seçimi</h4>
                            <ul className="space-y-3 text-zinc-300">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> N690 Böhler (Paslanmaz)</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> M390 (Mikro Toz Metalurji)</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Karbon Damascus (Desenli)</li>
                            </ul>
                        </div>

                        {/* Handle Card */}
                        <div className="bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Leaf className="w-32 h-32 text-white" />
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-xl flex items-center justify-center mb-6">
                                <TreeIcon className="w-6 h-6 text-amber-500" />
                            </div>
                            <h4 className="text-2xl font-bold mb-4 text-white">Kabza Materyali</h4>
                            <ul className="space-y-3 text-zinc-300">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Stabilize Kök Ceviz</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Geyik Boynuzu</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Hibrit Epoksi & Ahşap</li>
                            </ul>
                        </div>

                        {/* Finish Card */}
                        <div className="bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Sparkles className="w-32 h-32 text-white" />
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-xl flex items-center justify-center mb-6">
                                <Gem className="w-6 h-6 text-amber-500" />
                            </div>
                            <h4 className="text-2xl font-bold mb-4 text-white">Yüzey İşlemleri</h4>
                            <ul className="space-y-3 text-zinc-300">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Satin (Mat)</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Mirror Polish (Ayna)</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Stonewash (Eskitme)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Corporate / Wholesale Section */}
            <section className="py-32 px-6 bg-stone-900 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('/pattern-dark.png')] bg-repeat" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600/20 text-yellow-500 rounded-full text-sm font-bold tracking-wide uppercase">
                                <Crown className="w-4 h-4" />
                                <span>Kurumsal Çözümler</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                                İşletmeniz İçin <br />
                                <span className="text-yellow-500">Kusursuz İmzalar</span>
                            </h2>
                            <p className="text-xl text-gray-400 leading-relaxed">
                                Otel, restoran ve steakhouse işletmeleri için özel üretim seriler.
                                Markanızın logosu, şeflerinizin istekleri ve işletmenizin karakterine uygun
                                toplu üretim çözümleri sunuyoruz.
                            </p>
                        </div>

                        {/* Highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full md:w-auto">
                            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <h4 className="text-xl font-bold text-yellow-500 mb-2">Steakhouse Serileri</h4>
                                <p className="text-sm text-gray-400">Müşteri deneyimini zirveye taşıyan, masada fark yaratan özel et bıçakları.</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <h4 className="text-xl font-bold text-yellow-500 mb-2">Şef Bıçakları</h4>
                                <p className="text-sm text-gray-400">Mutfağınızdaki profesyoneller için uzun ömürlü ve ergonomik setler.</p>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Sparkles, title: "Logo ve Markalama", desc: "Her bıçağın üzerine işletmenizin logosunu lazer veya asit indirme ile işliyoruz." },
                            { icon: Shield, title: "Endüstriyel Dayanıklılık", desc: "Yoğun ticari kullanıma uygun, bulaşık makinesine dayanıklı özel kabza seçenekleri." },
                            { icon: Gem, title: "Toptan Fiyat Avantajı", desc: "Adetli alımlarda işletmenize özel iskontolar ve esnek ödeme planları." }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4">
                                <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center text-yellow-500 flex-shrink-0">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                                    <p className="text-gray-400 text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <div className="max-w-3xl mx-auto text-center space-y-10">
                    <div className="space-y-4">
                        <span className="text-emerald-400 font-medium">Ücretsiz danışmanlık</span>
                        <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground">Hemen Konuşalım</h2>
                    </div>
                    <p className="text-muted-foreground text-xl leading-relaxed">
                        Bıçak konusunda hiçbir fikriniz olmasa bile sorun değil! Bütçenizi ve kullanım amacınızı söyleyin,
                        size en uygun seçenekleri <strong className="text-white">ücretsiz olarak</strong> sunalım.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="h-16 px-10 text-lg bg-[#25D366] hover:bg-[#128C7E] text-white gap-3 shadow-xl rounded-full w-full sm:w-auto transition-transform hover:-translate-y-1">
                            <Send className="w-6 h-6" />
                            WhatsApp'tan Yazın
                        </Button>
                        <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full border-2 border-zinc-600 w-full sm:w-auto hover:bg-zinc-800 hover:border-zinc-500 text-white font-medium">
                            Fiyat Listesi İste <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                    <p className="text-sm text-zinc-500">
                        ✓ Zorlama yok &nbsp; ✓ Ücretsiz fiyat teklifi &nbsp; ✓ Hızlı yanıt
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}

// Custom Tree Icon component since 'Tree' might not be exported directly or has a different name
function TreeIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 19v-9" />
            <path d="M7 2a10 10 0 1 0 10 0" />
            <path d="M5 22h14" />
        </svg>
    )
}
