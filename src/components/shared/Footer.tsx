import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#050505] border-t border-white/10 pt-24 pb-12 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-600/5 rounded-full blur-[128px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-20 mb-20">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="block">
                            <h3 className="text-3xl font-black tracking-tighter text-white font-sans">
                                AYBIÇAK<span className="text-yellow-600">.</span>
                            </h3>
                        </Link>
                        <p className="text-zinc-400 font-light text-sm leading-relaxed max-w-xs">
                            Anadolu'nun çelik işleme geleneğini modern tasarımla buluşturuyoruz. %100 el yapımı, ömürlük bıçaklar.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <SocialLink icon={Instagram} href="#" />
                            <SocialLink icon={Twitter} href="#" />
                            <SocialLink icon={Facebook} href="#" />
                        </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest border-l-2 border-yellow-600 pl-3">Kurumsal</h4>
                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li><FooterLink href="/about">Hakkımızda</FooterLink></li>
                            <li><FooterLink href="/contact">İletişim & Ulaşım</FooterLink></li>
                            <li><FooterLink href="/legal/dist-sales">Mesafeli Satış Sözleşmesi</FooterLink></li>
                            <li><FooterLink href="/legal/privacy">Gizlilik ve KVKK</FooterLink></li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest border-l-2 border-yellow-600 pl-3">Müşteri İlişkileri</h4>
                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li><FooterLink href="/account/orders">Sipariş Takibi</FooterLink></li>
                            <li><FooterLink href="/sss">Sıkça Sorulan Sorular</FooterLink></li>
                            <li><FooterLink href="/shipping">Kargo ve Teslimat</FooterLink></li>
                            <li><FooterLink href="/return">İade ve Değişim</FooterLink></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest border-l-2 border-yellow-600 pl-3">E-Bülten</h4>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Yeni koleksiyonlardan ve <span className="text-white font-medium">sadece üyelere özel</span> indirimlerden haberdar olun.
                        </p>
                        <div className="flex flex-col gap-3">
                            <div className="relative group">
                                <input
                                    type="email"
                                    placeholder="E-posta adresiniz"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-600/50 transition-colors"
                                />
                                <div className="absolute inset-0 rounded-lg bg-yellow-600/20 opacity-0 group-hover:opacity-100 blur transition-opacity -z-10" />
                            </div>
                            <Button variant="premium" className="w-full font-bold text-white">
                                Abone Ol
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-zinc-500 font-medium tracking-wide">
                        © 2026 Ay Bıçak. Tüm hakları saklıdır.
                    </p>
                    <div className="flex items-center gap-6">
                        {/* Payment Icons Placeholder */}
                        <div className="flex gap-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="h-6 w-10 bg-white/10 rounded overflow-hidden relative"><Image src="/visa.png" alt="Visa" fill className="object-cover" /></div>
                            <div className="h-6 w-10 bg-white/10 rounded overflow-hidden relative"><Image src="/mastercard.png" alt="Mastercard" fill className="object-cover" /></div>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <Link href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">Site Haritası</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ icon: Icon, href }: { icon: any, href: string }) {
    return (
        <Link
            href={href}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-yellow-600 hover:text-white hover:scale-110 transition-all duration-300"
        >
            <Icon className="w-5 h-5" />
        </Link>
    );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href} className="flex items-center gap-2 hover:text-yellow-500 transition-colors group">
            <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-yellow-500 transition-colors" />
            {children}
        </Link>
    );
}
