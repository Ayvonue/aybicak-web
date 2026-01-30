"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { User, Package, MapPin, LogOut, ChevronRight, Clock, Truck, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push("/");
        }
    }, [user, router]);

    if (!user) return null;

    // Mock Orders Data
    const orders = [
        {
            id: "TR-829102",
            date: "30 Ocak 2026",
            status: "processing", // processing, shipped, delivered, cancelled
            total: 4250,
            items: [
                { name: "Sürmene El Yapımı Şef Bıçağı", variant: "Ceviz Kabza" },
                { name: "Deri Bıçak Kılıfı", variant: "Kahverengi" }
            ]
        },
        {
            id: "TR-772101",
            date: "15 Aralık 2025",
            status: "delivered",
            total: 1850,
            items: [
                { name: "Kamp ve Av Bıçağı", variant: "Geyik Boynuzu" }
            ]
        }
    ];

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
                                                    <p className="text-sm font-medium text-white">{order.date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-1">Toplam Tutar</p>
                                                    <p className="text-sm font-medium text-white">₺{order.total.toLocaleString("tr-TR")},00</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-1">Sipariş No</p>
                                                    <p className="text-sm font-medium text-white">{order.id}</p>
                                                </div>
                                            </div>
                                            <button className="text-sm font-medium text-yellow-500 hover:text-yellow-400 flex items-center gap-1">
                                                Detayları Gör <ChevronRight className="w-4 h-4" />
                                            </button>
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
                                                            <span>{item.name}</span>
                                                            <span className="text-zinc-500 text-xs">({item.variant})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2 min-w-[200px]">
                                                {order.status === "delivered" ? (
                                                    <button className="w-full py-2.5 px-4 rounded-lg bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors">
                                                        Tekrar Satın Al
                                                    </button>
                                                ) : (
                                                    <button className="w-full py-2.5 px-4 rounded-lg bg-yellow-600 text-white font-bold text-sm hover:bg-yellow-500 transition-colors">
                                                        Kargo Takibi
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
