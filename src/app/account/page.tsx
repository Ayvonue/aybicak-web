"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { User, Package, MapPin, LogOut, Settings, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AccountPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push("/");
        }
    }, [user, router]);

    if (!user) return null;

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
                            <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-white/10 rounded-xl">
                                <User className="w-4 h-4" />
                                Profilim
                            </Link>
                            <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
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
                    <div className="flex-1 space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Hoşgeldin, {user.name}</h1>
                            <p className="text-zinc-400">Hesap bilgilerinizi ve siparişlerinizi buradan yönetebilirsiniz.</p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-6">
                                <div className="w-10 h-10 rounded-full bg-yellow-600/20 text-yellow-500 flex items-center justify-center mb-4">
                                    <Package className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">2</h3>
                                <p className="text-sm text-zinc-500">Aktif Sipariş</p>
                            </div>
                            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-6">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-4">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">%5</h3>
                                <p className="text-sm text-zinc-500">Üye İndirimi</p>
                            </div>
                            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-6">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-4">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">1</h3>
                                <p className="text-sm text-zinc-500">Kayıtlı Adres</p>
                            </div>
                        </div>

                        {/* Recent Orders Preview */}
                        <div className="bg-[#18181B] border border-white/10 rounded-2xl p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Son Siparişler</h3>
                                <Link href="/account/orders" className="text-sm text-yellow-500 hover:text-yellow-400">Tühünü Gör</Link>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                                            {/* Placeholder for order item image */}
                                            <Package className="text-black opacity-20" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">#TR-829102</p>
                                            <p className="text-sm text-zinc-500">30 Ocak 2026</p>
                                            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 uppercase font-bold">
                                                Hazırlanıyor
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white">₺4.250,00</p>
                                        <p className="text-xs text-zinc-500">2 Ürün</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Details Form (Read Only for now) */}
                        <div className="bg-[#18181B] border border-white/10 rounded-2xl p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Kişisel Bilgiler</h3>
                                <Button variant="outline" size="sm" className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/5">Düzenle</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500">Ad Soyad</label>
                                    <div className="text-sm text-white font-medium p-3 rounded-lg bg-black/40 border border-white/5">{user.name} {user.surname}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500">E-Posta</label>
                                    <div className="text-sm text-white font-medium p-3 rounded-lg bg-black/40 border border-white/5">{user.email}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500">Telefon</label>
                                    <div className="text-sm text-white font-medium p-3 rounded-lg bg-black/40 border border-white/5">{user.phone || "-"}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500">Doğum Tarihi</label>
                                    <div className="text-sm text-white font-medium p-3 rounded-lg bg-black/40 border border-white/5">{user.birthDate || "-"}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
