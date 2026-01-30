"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Send, Phone, MapPin } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />

            {/* Hero */}
            <section className="pt-48 pb-16 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm mb-8">
                        <MapPin className="w-4 h-4" />
                        Denizli / Yatağan
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Hakkımızda</h1>
                </motion.div>
            </section>

            {/* Main Content */}
            <section className="py-16 px-6">
                <div className="max-w-3xl mx-auto space-y-16">

                    {/* About Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="prose prose-lg prose-invert max-w-none"
                    >
                        <p className="text-zinc-300 text-lg leading-relaxed">
                            Geçmişten Günümüze Denizli'nin Yatağan Kasabasında; Dededen Toruna Geçen Bıçak İmalatını,
                            En Temiz Şekilde El İşçiliği ile Profesyonel Kadromuz ile İmalata Devam Ediyor, Siz Müşterilerimize Temin Ediyoruz.
                        </p>

                        <p className="text-zinc-300 text-lg leading-relaxed">
                            Her Türlü Kama, Av Bıçağı, Kasap Bıçağı, Mutfak Bıçağı, Kılıç Ürünleri İmalat Ediyoruz.
                            Özel İstekleride Boyu Ölçüsü Fark Etmeksizin Sizler İçin Üretiyoruz.
                            Sipariş Verdiğiniz Ürünün Üzerine Lazer İşlemeli İstediğiniz Yazıyıda Sizler İçin Yazıyoruz.
                        </p>

                        <p className="text-emerald-400 text-lg font-medium pb-8">
                            Özel Siparişleriniz Ve Toptan Ürünler için 7/24 Bize Ulaşabilirsiniz.
                        </p>
                    </motion.div>

                    {/* Yatağan History */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8 mt-16"
                    >
                        <h2 className="text-3xl font-bold text-white border-b border-white/10 pb-4 mb-4 pt-8">
                            Yatağan Kasabamızın Tarihçesi
                        </h2>

                        <div className="text-zinc-300 text-lg leading-relaxed space-y-6">
                            <p>
                                Serinhisar ilçesinin Yatağan kasabasında, Yatağan Baba'nın yadigârı olan demircilik sanatı köyün kurulduğu tarihten beri devam etmektedir. Buna bağlı olarak bıçakçılık sanatı gelişmiş olup, bıçak, çakı, tahra, balta, makas, kırklık, saban demiri ve pala gibi iş aletleri günümüzde de yapılmaktadır. Ülkenin her yerine gönderilerek, Yatağan insanının maden sanatındaki yaratıcılığı ve tarihten beri süregelen ata sanatı tanıtılmaktadır.
                            </p>

                            <p>
                                Yatağan adıyla özdeşleşen palalar, literatüre "Yatağan" olarak girmiştir. XIII. Yüzyılın başlarında Osman Gazi'nin askerleri de, kendi sanatkârları tarafından imal edilerek, erleri tarafından kılıç yerine kullanılmış, Türkiye'nin her yerinde Yatağan palası adını taşımaktadır.
                            </p>
                        </div>
                    </motion.div>

                    {/* Yatağan Knives */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <h2 className="text-3xl font-bold text-white border-b border-white/10 pb-4 mb-4 pt-8">
                            Yatağan Bıçakları
                        </h2>

                        <div className="text-zinc-300 text-lg leading-relaxed space-y-6">
                            <p>
                                Yatağan'da yüzyıllara dayanan demircilik sanatı halen devam ettiği şekliyle az çok eskiyi andırmaktadır. Neticede demircilik mesleği günümüzde de tamamen değişmemiş, ileri düzeyde makineleşmeyle birlikte gelişmiştir. Bıçak yapımına geçmeden önce, Yatağan'da geleneksel metotlara göre üretilen bıçak malzemelerini sıralamak istiyoruz. Bunlar; demir, meşin körük ocağı, çekiçler, örs, mengene, keser, kıskaç, suntıraç, kalıp, keçe, zımpara taşı, bileği taşı, çark, aşkı takımı, kömür, zeytinyağı, kemik, tel, delgi, keski, törpü, eğe, mühür, kaz zağı, tığ, saplık usturası, saplık demirinden meydana geldiği görülür.
                            </p>

                            <p>
                                1950'li yıllardan sonra ise yassı çeliğin üretilmesiyle birlikte bıçak yapım metotları da değişmiştir. Yassı halde hazır olarak gelen bu demirler önce şerit kesme makinesiyle şeritler halinde kesilir, bu çubuklar körükte kızdırılarak çift çekiçle karşılıklı olarak hem şekillendirilir hem de sertleştirilir. Bu parça üç defa ısıtılıp dövülür. Sonra sap ölçüsü ile beraber bu şekil kesilir.
                            </p>

                            <p>
                                Sap işleminde ise iki defa daha ısıtılıp çift çekiçle son şekli verilir. Saptaki damga ve deliğin daha kolay yapılabilmesi için bıçak tekrar tavlanır, rengi değişmeden delik alt havşası üst yuvarlak damga ile delinir. Damgalar çelikten yapılır ve üzerinde ters yazılı kelimeler bulunur.
                            </p>

                            <p>
                                Çeliğin kullanımda daha sağlam olması, iyi çalışması ve ilk keskinliğini koruması için 1-1,5 kg'lık çekiçlerle ısıtılmadan dövülür, buna da "kuru çekiç" işlemi adı verilir. Böylelikle darbeler demirin her tarafına temayüz eder molekülleri sıkışır ve demir daha mukavemetli olur. Daha sonra belirli tip ve modellere göre sapları yapılır su verme işlemine geçilir. Su verme işlemi yine göz kararı ile değişik metotlarla yapılır.
                            </p>
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-xl mx-auto text-center space-y-8">
                    <h2 className="text-3xl font-bold text-white">Bize Ulaşın</h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="h-14 px-8 bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 rounded-full">
                            <Send className="w-5 h-5" />
                            WhatsApp
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-zinc-600 hover:bg-zinc-800 text-white gap-2">
                            <Phone className="w-5 h-5" />
                            Arayın
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
