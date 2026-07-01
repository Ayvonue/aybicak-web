"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

type AdminProduct = Product & { active: boolean };
type FormState = Partial<AdminProduct> & { id: string };

const EMPTY: FormState = {
    id: "", name: "", price: 0, category: "", steel: "", hardness: "", handle: "",
    imageUrl: "", description: "", fullLength: "", barrelLength: "", thickness: "",
    isNew: false, active: true,
};

export default function ProductsClient({ products }: { products: AdminProduct[] }) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState<FormState | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const filtered = products.filter(
        (p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.id.includes(query)
    );

    const openCreate = () => { setEditing({ ...EMPTY }); setIsNew(true); setError(""); };
    const openEdit = (p: AdminProduct) => { setEditing({ ...p }); setIsNew(false); setError(""); };

    const save = async () => {
        if (!editing) return;
        setSaving(true);
        setError("");
        try {
            const url = isNew ? "/api/admin/products" : `/api/admin/products/${editing.id}`;
            const res = await fetch(url, {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...editing, price: Number(editing.price) }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Kaydedilemedi."); return; }
            setEditing(null);
            router.refresh();
        } catch {
            setError("Bağlantı hatası.");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id: string, name: string) => {
        if (!confirm(`"${name}" ürünü silinsin mi? Bu işlem geri alınamaz.`)) return;
        const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        if (res.ok) router.refresh();
    };

    const field = (key: keyof FormState, label: string, type: "text" | "number" = "text") => (
        <div>
            <label className="text-xs text-zinc-500 block mb-1">{label}</label>
            <input
                type={type}
                value={(editing?.[key] as string | number) ?? ""}
                onChange={(e) => setEditing((f) => f ? { ...f, [key]: type === "number" ? e.target.value : e.target.value } : f)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
            />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="text-zinc-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
                    <h1 className="text-xl font-bold">Ürünler <span className="text-zinc-500 font-normal text-sm">({products.length})</span></h1>
                </div>
                <Button onClick={openCreate} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold">
                    <Plus className="w-4 h-4 mr-2" /> Yeni Ürün
                </Button>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ürün adı veya ID ile ara..."
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-yellow-500"
                />
            </div>

            <div className="bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-zinc-500 text-xs uppercase border-b border-white/5">
                                <th className="px-4 py-3">Ürün</th>
                                <th className="px-4 py-3 hidden sm:table-cell">Kategori</th>
                                <th className="px-4 py-3 text-right">Fiyat</th>
                                <th className="px-4 py-3 text-center">Durum</th>
                                <th className="px-4 py-3 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.slice(0, 100).map((p) => (
                                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="px-4 py-3">
                                        <p className="text-white line-clamp-1">{p.name.trim()}</p>
                                        <p className="text-[11px] text-zinc-600 font-mono">{p.id}</p>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400 hidden sm:table-cell">{p.category}</td>
                                    <td className="px-4 py-3 text-right text-white font-medium">{formatPrice(p.price)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.active ? "bg-green-500/20 text-green-400" : "bg-zinc-600/30 text-zinc-500"}`}>
                                            {p.active ? "Aktif" : "Pasif"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(p)} className="p-2 text-zinc-400 hover:text-yellow-500" aria-label="Düzenle"><Pencil className="w-4 h-4" /></button>
                                            <button onClick={() => remove(p.id, p.name)} className="p-2 text-zinc-400 hover:text-red-400" aria-label="Sil"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length > 100 && (
                    <p className="p-3 text-center text-xs text-zinc-600">İlk 100 sonuç gösteriliyor — aramayı daraltın.</p>
                )}
            </div>

            {/* Editör modal */}
            {editing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => !saving && setEditing(null)}>
                    <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-[#18181b]">
                            <h2 className="font-bold">{isNew ? "Yeni Ürün" : "Ürünü Düzenle"}</h2>
                            <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">{error}</div>}
                            <div className="grid grid-cols-2 gap-4">
                                {isNew
                                    ? field("id", "Ürün ID (benzersiz)")
                                    : <div><label className="text-xs text-zinc-500 block mb-1">Ürün ID</label><div className="px-3 py-2 text-sm text-zinc-500 font-mono bg-black/20 rounded-lg">{editing.id}</div></div>}
                                {field("price", "Fiyat (₺)", "number")}
                            </div>
                            {field("name", "Ürün Adı")}
                            <div className="grid grid-cols-2 gap-4">
                                {field("category", "Kategori")}
                                {field("steel", "Çelik")}
                                {field("hardness", "Sertlik")}
                                {field("handle", "Kabze")}
                                {field("fullLength", "Tam Boy")}
                                {field("barrelLength", "Namlu")}
                                {field("thickness", "Kalınlık")}
                                {field("imageUrl", "Görsel Yolu (/products/...)")}
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 block mb-1">Açıklama</label>
                                <textarea
                                    value={editing.description ?? ""}
                                    onChange={(e) => setEditing((f) => f ? { ...f, description: e.target.value } : f)}
                                    className="w-full h-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-500 resize-none"
                                />
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                                    <input type="checkbox" checked={Boolean(editing.isNew)} onChange={(e) => setEditing((f) => f ? { ...f, isNew: e.target.checked } : f)} />
                                    Yeni ürün rozeti
                                </label>
                                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                                    <input type="checkbox" checked={editing.active !== false} onChange={(e) => setEditing((f) => f ? { ...f, active: e.target.checked } : f)} />
                                    Sitede yayında (aktif)
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-white/10 sticky bottom-0 bg-[#18181b]">
                            <Button onClick={save} disabled={saving} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold flex-1">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kaydet"}
                            </Button>
                            <Button onClick={() => setEditing(null)} variant="outline" disabled={saving}>Vazgeç</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
