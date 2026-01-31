"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Truck, Shield, CreditCard, Package, Phone, Mail } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const faqCategories = [
    {
        title: "Sipariş ve Ödeme",
        icon: CreditCard,
        questions: [
            {
                q: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
                a: "Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerini sunuyoruz. Tüm kredi kartı işlemleri 256-bit SSL şifreleme ile korunmaktadır."
            },
            {
                q: "Taksitli ödeme yapabilir miyim?",
                a: "Evet, 500₺ üzeri alışverişlerinizde 3, 6 veya 9 taksit seçeneklerinden yararlanabilirsiniz. Taksit seçenekleri bankanıza göre değişiklik gösterebilir."
            },
            {
                q: "Siparişimi nasıl iptal edebilirim?",
                a: "Siparişiniz kargoya verilmeden önce müşteri hizmetlerimizi arayarak veya WhatsApp üzerinden iptal talebinde bulunabilirsiniz. Kargoya verilen siparişler için iade sürecini başlatmanız gerekmektedir."
            },
            {
                q: "Fatura bilgilerimi nasıl değiştirebilirim?",
                a: "Sipariş onaylandıktan sonra fatura bilgilerini değiştirmek için en kısa sürede müşteri hizmetlerimizle iletişime geçmeniz gerekmektedir."
            }
        ]
    },
    {
        title: "Kargo ve Teslimat",
        icon: Truck,
        questions: [
            {
                q: "Kargo ücreti ne kadar?",
                a: "750₺ ve üzeri siparişlerde kargo ücretsizdir. Bu tutarın altındaki siparişlerde sabit 49,90₺ kargo ücreti uygulanmaktadır."
            },
            {
                q: "Siparişim ne zaman elime ulaşır?",
                a: "Stokta bulunan ürünler sipariş onayından itibaren 1-3 iş günü içinde kargoya verilir. Kargo süresi bulunduğunuz bölgeye göre 1-3 gün arasında değişmektedir. Özel üretim siparişler 7-14 iş günü sürebilir."
            },
            {
                q: "Kargo takibi nasıl yapabilirim?",
                a: "Siparişiniz kargoya verildiğinde size SMS ve e-posta ile takip numarası gönderilir. 'Hesabım > Siparişlerim' bölümünden de takip edebilirsiniz."
            },
            {
                q: "Yurt dışına gönderim yapıyor musunuz?",
                a: "Evet, Avrupa ülkelerine gönderim yapıyoruz. Yurt dışı kargo ücretleri ülkeye ve ağırlığa göre değişmektedir. Detaylı bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz."
            }
        ]
    },
    {
        title: "Ürün ve Garanti",
        icon: Shield,
        questions: [
            {
                q: "Bıçaklarınız hangi malzemeden üretiliyor?",
                a: "Bıçaklarımızda N690, D2, 1.4116 ve Şam çeliği gibi premium kalite çelikler kullanıyoruz. Sap malzemesi olarak ceviz, zeytin ağacı, geyik boynuzu ve kompozit malzemeler tercih ediyoruz."
            },
            {
                q: "Garanti süresi ne kadar?",
                a: "Tüm ürünlerimiz 1 yıl üretim hatası garantisi kapsamındadır. Kullanıcı kaynaklı hasarlar (düşürme, yanlış kullanım, bilemeden kaynaklı hasar) garanti kapsamı dışındadır."
            },
            {
                q: "Bıçağımı nasıl bilemeliyim?",
                a: "Bıçaklarımız keskin olarak teslim edilir. Bileme için 1000-3000 grit arası Japon tipi su taşı veya seramik bileme çubuğu öneriyoruz. Elektrikli bileyiciler bıçağa zarar verebilir."
            },
            {
                q: "Bıçağımı nasıl bakım yapmalıyım?",
                a: "Kullanımdan sonra ılık su ve sabunla yıkayıp kurulayın. Bulaşık makinesine koymayın. Uzun süreli saklamada gıda yağı veya kamelya yağı sürmenizi öneririz."
            }
        ]
    },
    {
        title: "İade ve Değişim",
        icon: Package,
        questions: [
            {
                q: "İade koşulları nelerdir?",
                a: "Ürünü teslim aldıktan sonra 14 gün içinde iade talebinde bulunabilirsiniz. Ürün kullanılmamış, orijinal ambalajında ve tüm aksesuarlarıyla birlikte olmalıdır."
            },
            {
                q: "İade kargo ücreti kime ait?",
                a: "Ürün hasarlı veya hatalı ise kargo ücreti bize aittir. Müşteri kaynaklı iadelerde kargo ücreti müşteriye aittir."
            },
            {
                q: "Param ne zaman iade edilir?",
                a: "İade edilen ürün depomuzda kontrol edildikten sonra 3-7 iş günü içinde ödemeniz iade edilir. Kredi kartı iadelerinde bankanızın işlem süresi değişebilir."
            },
            {
                q: "Özel üretim ürünleri iade edebilir miyim?",
                a: "Özel tasarım ve kişiye özel üretilen ürünler (isim yazılı, özel boyut vb.) üretim hatası dışında iade edilemez."
            }
        ]
    }
];

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
                            const Icon = cat.icon;
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
                                const Icon = faqCategories[activeCategory].icon;
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
                                href="tel:+905551234567"
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
