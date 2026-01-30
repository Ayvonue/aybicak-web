import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
    title: "İletişim | Ay Bıçak",
    description: "Bizimle iletişime geçin. Özel sipariş, toptan alım ve teknik destek için WhatsApp, telefon veya adres bilgilerimiz.",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center">İletişim</h1>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Phone */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-colors group">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Phone className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">Telefon</h3>
                        <p className="text-zinc-400">+90 555 555 55 55</p>
                        <p className="text-zinc-500 text-sm mt-1">Hafta içi: 09:00 - 18:00</p>
                    </div>

                    {/* Address */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-colors group">
                        <div className="w-12 h-12 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">Atölye</h3>
                        <p className="text-zinc-400">Yatağan Mahallesi<br />Serinhisar / Denizli</p>
                    </div>

                    {/* Email */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-colors group">
                        <div className="w-12 h-12 bg-indigo-500/20 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">E-Posta</h3>
                        <p className="text-zinc-400">info@aybicak.com</p>
                        <p className="text-zinc-500 text-sm mt-1">24 saat içinde dönüş</p>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
