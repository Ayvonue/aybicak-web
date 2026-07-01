"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Package, MapPin, LogOut, Clock, Truck, CheckCircle, Loader2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

interface AccountOrder {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    items: { id: string; name: string; quantity: number; price: number }[];
}

export default function OrdersPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<AccountOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/");
        }
    }, [user, router]);

    useEffect(() => {
        if (!user) return;
        fetch("/api/account/orders")
            .then((r) => r.json())
            .then((d) => setOrders(d.orders || []))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) return null;

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "processing":
                return { label: "Hazırlanıyor", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Clock };
            case "shipped":
                return { label: "Kargoda", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Truck };
            case "delivered":
                return { label: "Teslim Edildi", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle };
            default:
                return { label: "İptal Edildi", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: LogOut };
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 space-y-4">
                        <div className="bg-[#18181B] border border-white/10 rounded-2xl p-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-yellow-600 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white">
                                {user.name[0]}{user.surname[0]}
                            </div>
                            <h2 className="text-xl font-bold text-white">{user.name} {user.surname}</h2>
                            <p className="text-sm text-zinc-500">{user.email}</p>
                        </div>

                        <nav className="bg-[#18181B] border border-white/10 rounded-2xl p-2 space-y-1">
                            <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                                <User className="w-4 h-4" />
                                Profilim
                            </Link>
                            <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-white/10 rounded-xl transition-colors">
                                <Package className="w-4 h-4" />
                                Siparişlerim
                            </Link>
                            <Link href="/account/addresses" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                                <MapPin className="w-4 h-4" />
                                Adreslerim
                            </Link>
                            <button
                                onClick={() => { logout(); router.push("/"); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Çıkış Yap
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Siparişlerim</h1>
                            <p className="text-zinc-400">Verdiğiniz tüm siparişleri buradan takip edebilirsiniz.</p>
                        </div>

                        {orders.length === 0 && (
                            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-12 text-center space-y-4">
                                <Package className="w-12 h-12 mx-auto text-zinc-600" />
                                <p className="text-zinc-400">Henüz siparişiniz bulunmuyor.</p>
                                <Link href="/shop" className="inline-block text-sm text-yellow-500 hover:text-yellow-400 font-medium">
                                    Koleksiyonu Keşfet →
                                </Link>
                            </div>
                        )}

                        {loading ? (
                            <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
                        ) : orders.length === 0 ? (
                            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-12 text-center space-y-4">
                                <Package className="w-12 h-12 mx-auto text-zinc-600" />
                                <p className="text-zinc-400">Henüz siparişiniz bulunmuyor.</p>
                                <Link href="/shop" className="inline-block text-sm text-yellow-500 hover:text-yellow-400 font-medium">
                                    Koleksiyonu Keşfet →
                                </Link>
                            </div>
                        ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const status = getStatusConfig(order.status);
                                const StatusIcon = status.icon;

                                return (
                                    <div key={order.id} className="bg-[#18181B] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
                                        {/* Header */}
                                        <div className="p-4 md:p-6 bg-white/5 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
                                            <div className="flex gap-4 md:gap-8">
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-1">Sipariş Tarihi</p>
                                                    <p className="text-sm font-medium text-white">{new Date(order.createdAt).toLocaleDateString("tr-TR")}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-1">Toplam Tutar</p>
                                                    <p className="text-sm font-medium text-white">{formatPrice(order.total)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-1">Sipariş No</p>
                                                    <p className="text-sm font-medium text-white font-mono">{order.id}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                            <div className="space-y-3">
                                                <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border", status.color, status.bg, status.border)}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {status.label}
                                                </div>
                                                <div className="space-y-1">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                                                            <div className="w-1 h-1 rounded-full bg-zinc-600" />
                                                            <span>{item.quantity}× {item.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 min-w-[200px]">
                                                <Link href={`/order-track?id=${encodeURIComponent(order.id)}`} className="w-full py-2.5 px-4 rounded-lg bg-yellow-600 text-white font-bold text-sm hover:bg-yellow-500 transition-colors text-center">
                                                    Sipariş Takibi
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
