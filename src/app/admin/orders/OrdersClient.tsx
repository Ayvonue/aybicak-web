"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/orders";
import { ORDER_STATUSES } from "@/lib/orders";

const STATUS_LABELS: Record<string, string> = {
    pending: "Ödeme Bekliyor",
    processing: "Hazırlanıyor",
    shipped: "Kargoda",
    delivered: "Teslim Edildi",
    cancelled: "İptal",
};

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
    processing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    delivered: "bg-green-500/20 text-green-400 border-green-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function OrdersClient({ orders: initial }: { orders: Order[] }) {
    const [orders, setOrders] = useState(initial);
    const [busy, setBusy] = useState<string | null>(null);

    const changeStatus = async (id: string, status: string) => {
        setBusy(id);
        const prev = orders;
        setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) setOrders(prev);
        } catch {
            setOrders(prev);
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-8">
                <Link href="/admin" className="text-zinc-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
                <h1 className="text-xl font-bold">Siparişler <span className="text-zinc-500 font-normal text-sm">({orders.length})</span></h1>
            </div>

            {orders.length === 0 ? (
                <div className="bg-[#18181b] border border-white/10 rounded-2xl p-12 text-center">
                    <Package className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
                    <p className="text-zinc-400">Henüz sipariş yok.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((o) => (
                        <div key={o.id} className="bg-[#18181b] border border-white/10 rounded-2xl p-5">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <div>
                                    <p className="font-mono text-sm text-white font-bold">{o.id}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {new Date(o.createdAt).toLocaleString("tr-TR")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[o.status] || STATUS_COLORS.pending}`}>
                                        {STATUS_LABELS[o.status] || o.status}
                                    </span>
                                    <select
                                        value={o.status}
                                        disabled={busy === o.id}
                                        onChange={(e) => changeStatus(o.id, e.target.value)}
                                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-yellow-500 disabled:opacity-50"
                                    >
                                        {ORDER_STATUSES.map((s) => (
                                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1 text-zinc-400">
                                    <p><span className="text-zinc-500">Müşteri:</span> <span className="text-white">{o.customerName}</span></p>
                                    <p><span className="text-zinc-500">Telefon:</span> <a href={`tel:${o.customerPhone}`} className="text-white hover:text-yellow-500">{o.customerPhone}</a></p>
                                    <p><span className="text-zinc-500">E-posta:</span> <a href={`mailto:${o.customerEmail}`} className="text-white hover:text-yellow-500">{o.customerEmail}</a></p>
                                    <p><span className="text-zinc-500">Adres:</span> <span className="text-white">{o.address}, {o.city}</span></p>
                                    <p><span className="text-zinc-500">Ödeme:</span> <span className="text-white">{o.paymentMethod === "card" ? "Kart" : o.paymentMethod === "transfer" ? "Havale/EFT" : "Kapıda"}</span></p>
                                    {o.notes && <p><span className="text-zinc-500">Not:</span> <span className="text-white">{o.notes}</span></p>}
                                </div>
                                <div className="bg-black/20 rounded-xl p-3 space-y-1.5">
                                    {o.items.map((it, i) => (
                                        <div key={i} className="flex justify-between text-xs">
                                            <span className="text-zinc-300">{it.quantity}× {it.name}</span>
                                            <span className="text-white font-medium">{formatPrice(it.price * it.quantity)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold">
                                        <span className="text-zinc-400">Toplam</span>
                                        <span className="text-yellow-500">{formatPrice(o.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
