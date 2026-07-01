"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import {
    Package, Tags, ShoppingCart, LogOut, Database, ExternalLink, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboard() {
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
    };

    const totalValue = products.reduce((acc, p) => acc + p.price, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-600/20 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Yönetim Paneli</h1>
                        <p className="text-xs text-zinc-500">Ay Bıçak</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/" target="_blank" className="text-sm text-zinc-400 hover:text-white flex items-center gap-1">
                        Siteyi Gör <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Button onClick={handleLogout} disabled={loggingOut} variant="outline" size="sm" className="border-white/10 text-zinc-300 hover:text-white">
                        <LogOut className="w-4 h-4 mr-2" /> Çıkış
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Package} label="Toplam Ürün" value={products.length.toString()} color="text-yellow-500 bg-yellow-500/10" />
                <StatCard icon={Tags} label="Kategori" value={categories.length.toString()} color="text-blue-400 bg-blue-500/10" />
                <StatCard icon={ShoppingCart} label="Sipariş" value="—" color="text-emerald-400 bg-emerald-500/10" hint="DB bekliyor" />
                <StatCard icon={Database} label="Katalog Değeri" value={formatPrice(totalValue)} color="text-purple-400 bg-purple-500/10" />
            </div>

            {/* DB uyarısı */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 mb-8 flex items-start gap-3">
                <Database className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="text-white font-semibold mb-1">Ürün & sipariş yönetimi veritabanı bekliyor</p>
                    <p className="text-zinc-400 leading-relaxed">
                        Ürünler şu an <code className="text-zinc-300 bg-black/40 px-1 rounded">products.ts</code> dosyasından
                        salt-okunur listeleniyor. Ekle / düzenle / sil ve gerçek sipariş listesi için Vercel Postgres
                        veya Supabase bağlanması gerekiyor. Bağlantı adresi (<code className="text-zinc-300 bg-black/40 px-1 rounded">DATABASE_URL</code>)
                        eklendiğinde bu panel tam CRUD ile aktifleşir.
                    </p>
                </div>
            </div>

            {/* Ürünler (salt-okunur önizleme) */}
            <div className="bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-bold flex items-center gap-2"><Package className="w-4 h-4 text-yellow-500" /> Ürünler</h2>
                    <span className="text-xs text-zinc-500">{products.length} ürün · salt-okunur</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
                                <th className="px-5 py-3 font-medium">ID</th>
                                <th className="px-5 py-3 font-medium">Ürün</th>
                                <th className="px-5 py-3 font-medium hidden sm:table-cell">Kategori</th>
                                <th className="px-5 py-3 font-medium text-right">Fiyat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.slice(0, 15).map((p) => (
                                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="px-5 py-3 text-zinc-500 font-mono text-xs">{p.id}</td>
                                    <td className="px-5 py-3 text-white">
                                        <Link href={`/product/${p.id}`} target="_blank" className="hover:text-yellow-500 line-clamp-1">
                                            {p.name.trim()}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3 text-zinc-400 hidden sm:table-cell">{p.category}</td>
                                    <td className="px-5 py-3 text-right text-white font-medium">{formatPrice(p.price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 text-center text-xs text-zinc-600 border-t border-white/5">
                    İlk 15 ürün gösteriliyor · Düzenleme veritabanı bağlanınca açılacak
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, hint }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    color: string;
    hint?: string;
}) {
    return (
        <div className="bg-[#18181b] border border-white/10 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-zinc-500">{label}{hint && <span className="ml-1 text-[10px] text-zinc-600">({hint})</span>}</p>
        </div>
    );
}
