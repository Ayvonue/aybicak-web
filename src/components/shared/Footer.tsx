import { Facebook, Instagram, Twitter, CreditCard, Landmark } from "lucide-react";
import Link from "next/link";
import NewsletterForm from "@/components/shared/NewsletterForm";
import { siteConfig } from "@/lib/site";
import { categories } from "@/data/categories";

export default function Footer() {
    return (
        <footer className="bg-[#050505] border-t border-white/10 pt-24 pb-12 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-600/5 rounded-full blur-[128px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-12 mb-20">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="block">
                            <h3 className="text-3xl font-black tracking-tighter text-white font-sans">
                                AYBIÇAK<span className="text-yellow-600">.</span>
                            </h3>
                        </Link>
                        <p className="text-zinc-400 font-light text-sm leading-relaxed max-w-xs">
                            Anadolu&apos;nun çelik işleme geleneğini modern tasarımla buluşturuyoruz. %100 el yapımı, ömürlük bıçaklar.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <SocialLink icon={Instagram} href={siteConfig.social.instagram} label="Instagram" />
                            <SocialLink icon={Twitter} href={siteConfig.social.twitter} label="Twitter" />
                            <SocialLink icon={Facebook} href={siteConfig.social.facebook} label="Facebook" />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest border-l-2 border-yellow-600 pl-3">Koleksiyon</h4>
                        <ul className="space-y-3 text-sm text-zinc-400">
                            {categories.map((category) => (
                                <li key={category.slug}>
                                    <FooterLink href={`/category/${category.slug}`}>{category.h1}</FooterLink>
                                </li>
                            ))}
                        </ul>
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
                            <li><FooterLink href="/order-track">Sipariş Takibi</FooterLink></li>
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
                        <NewsletterForm />
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-zinc-500 font-medium tracking-wide">
                        © {new Date().getFullYear()} Ay Bıçak. Tüm hakları saklıdır.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-zinc-500 text-xs">
                            <span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> Kapıda Ödeme</span>
                            <span className="flex items-center gap-1.5"><Landmark className="w-4 h-4" /> Havale / EFT</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <a href="/sitemap.xml" className="text-xs text-zinc-500 hover:text-white transition-colors">Site Haritası</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ icon: Icon, href, label }: { icon: React.ComponentType<{ className?: string }>, href: string, label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-yellow-600 hover:text-white hover:scale-110 transition-all duration-300"
        >
            <Icon className="w-5 h-5" />
        </a>
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
