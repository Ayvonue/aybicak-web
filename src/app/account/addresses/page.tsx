"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Package, MapPin, LogOut, Plus, Trash2, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Address {
    id: string;
    title: string;
    fullAddress: string;
    district: string;
    city: string;
}

const STORAGE_KEY = "aybicak-addresses";

export default function AddressesPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        } catch {
            return [];
        }
    });
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: "", fullAddress: "", district: "", city: "" });

    useEffect(() => {
        if (!user) {
            router.push("/");
        }
    }, [user, router]);

    const saveAddresses = (next: Address[]) => {
        setAddresses(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.fullAddress.trim() || !form.city.trim()) return;
        saveAddresses([...addresses, { id: Date.now().toString(), ...form }]);
        setForm({ title: "", fullAddress: "", district: "", city: "" });
        setShowForm(false);
    };

    const handleDelete = (id: string) => {
        saveAddresses(addresses.filter((a) => a.id !== id));
    };

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
                            <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                                <User className="w-4 h-4" />
                                Profilim
                            </Link>
                            <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                                <Package className="w-4 h-4" />
                                Siparişlerim
                            </Link>
                            <Link href="/account/addresses" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-white/10 rounded-xl transition-colors">
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
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Adreslerim</h1>
                                <p className="text-zinc-400">Teslimat adreslerinizi buradan yönetebilirsiniz.</p>
                            </div>
                            <Button
                                onClick={() => setShowForm(!showForm)}
                                className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Yeni Adres
                            </Button>
                        </div>

                        {showForm && (
                            <form onSubmit={handleAdd} className="bg-[#18181B] border border-white/10 rounded-2xl p-6 space-y-4">
                                <h3 className="text-lg font-bold text-white">Yeni Adres Ekle</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Adres Başlığı (Ev, İş vb.)"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    />
                                    <Input
                                        label="İlçe"
                                        value={form.district}
                                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                                    />
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Açık Adres"
                                            value={form.fullAddress}
                                            onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                                        />
                                    </div>
                                    <Input
                                        label="Şehir"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button type="submit" className="bg-white text-black hover:bg-zinc-200 font-bold">Kaydet</Button>
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Vazgeç</Button>
                                </div>
                            </form>
                        )}

                        {addresses.length === 0 && !showForm ? (
                            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-12 text-center space-y-4">
                                <Home className="w-12 h-12 mx-auto text-zinc-600" />
                                <p className="text-zinc-400">Henüz kayıtlı adresiniz yok.</p>
                                <p className="text-sm text-zinc-500">Yeni adres ekleyerek ödeme adımında zaman kazanın.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((address) => (
                                    <div key={address.id} className="bg-[#18181B] border border-white/10 rounded-2xl p-6 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-white font-bold">
                                                <MapPin className="w-4 h-4 text-yellow-500" />
                                                {address.title}
                                            </div>
                                            <button
                                                onClick={() => handleDelete(address.id)}
                                                className="text-zinc-500 hover:text-red-400 transition-colors"
                                                aria-label="Adresi sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            {address.fullAddress}
                                            <br />
                                            {address.district && `${address.district} / `}{address.city}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
