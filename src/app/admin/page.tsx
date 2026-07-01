import Link from "next/link";
import { getAllProductsAdmin } from "@/lib/products-source";
import { listOrders } from "@/lib/orders";
import { isDbConfigured } from "@/lib/db";
import {
    Package, ShoppingCart, Database, ExternalLink, ShieldCheck, ArrowRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const dbOn = isDbConfigured();
    const products = dbOn ? await getAllProductsAdmin() : [];
    const orders = dbOn ? await listOrders(500) : [];

    const revenue = orders
        .filter((o) => o.status !== "cancelled" && o.status !== "pending")
        .reduce((acc, o) => acc + o.total, 0);
    const pendingCount = orders.filter((o) => o.status === "processing" || o.status === "pending").length;

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
                    <LogoutButton />
                </div>
            </div>

            {!dbOn && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-8 flex items-start gap-3">
                    <Database className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="text-white font-semibold mb-1">Veritabanı bağlı değil</p>
                        <p className="text-zinc-400">DATABASE_URL ortam değişkeni eklendiğinde ürün ve sipariş yönetimi aktifleşir.</p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Package} label="Ürün" value={products.length.toString()} color="text-yellow-500 bg-yellow-500/10" />
                <StatCard icon={ShoppingCart} label="Sipariş" value={orders.length.toString()} color="text-blue-400 bg-blue-500/10" />
                <StatCard icon={ShoppingCart} label="Bekleyen" value={pendingCount.toString()} color="text-emerald-400 bg-emerald-500/10" />
                <StatCard icon={Database} label="Ciro (net)" value={formatPrice(revenue)} color="text-purple-400 bg-purple-500/10" />
            </div>

            {/* Yönetim kartları */}
            <div className="grid sm:grid-cols-2 gap-4">
                <ManageCard
                    href="/admin/orders"
                    icon={ShoppingCart}
                    title="Siparişler"
                    desc="Siparişleri görüntüle, durumlarını güncelle (hazırlanıyor, kargoda, teslim edildi)."
                    stat={`${orders.length} sipariş`}
                />
                <ManageCard
                    href="/admin/products"
                    icon={Package}
                    title="Ürünler"
                    desc="Ürün ekle, düzenle, sil veya yayından kaldır. Değişiklikler sitede görünür."
                    stat={`${products.length} ürün`}
                />
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: {
    icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string;
}) {
    return (
        <div className="bg-[#18181b] border border-white/10 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-zinc-500">{label}</p>
        </div>
    );
}

function ManageCard({ href, icon: Icon, title, desc, stat }: {
    href: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string; stat: string;
}) {
    return (
        <Link href={href} className="group bg-[#18181b] border border-white/10 rounded-2xl p-6 hover:border-yellow-500/40 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-yellow-500">
                    <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="font-bold text-white text-lg">{title}</h2>
            <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{desc}</p>
            <p className="text-xs text-zinc-600 mt-3">{stat}</p>
        </Link>
    );
}
