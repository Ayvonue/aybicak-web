"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { Package, Clock, Truck, CheckCircle, XCircle, Loader2, Search } from "lucide-react";

const STATUS = {
    pending: { label: "Ödeme Bekleniyor", icon: Clock, color: "text-zinc-400", step: 0 },
    processing: { label: "Hazırlanıyor", icon: Package, color: "text-yellow-500", step: 1 },
    shipped: { label: "Kargoda", icon: Truck, color: "text-blue-400", step: 2 },
    delivered: { label: "Teslim Edildi", icon: CheckCircle, color: "text-green-500", step: 3 },
    cancelled: { label: "İptal Edildi", icon: XCircle, color: "text-red-400", step: -1 },
} as const;

interface TrackedOrder {
    id: string; status: string; total: number; createdAt: string;
    items: { name: string; quantity: number; price: number }[]; paymentMethod: string;
}

function TrackContent() {
    const params = useSearchParams();
    const [orderId, setOrderId] = useState("");
    const [email, setEmail] = useState("");
    const [order, setOrder] = useState<TrackedOrder | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const id = params.get("id");
        if (id) setOrderId(id);
    }, [params]);

    const track = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(""); setOrder(null);
        try {
            const res = await fetch("/api/order-track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, email }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Bulunamadı."); return; }
            setOrder(data.order);
        } catch {
            setError("Bağlantı hatası.");
        } finally {
            setLoading(false);
        }
    };

    const cfg = order ? (STATUS[order.status as keyof typeof STATUS] || STATUS.pending) : null;
    const steps = [STATUS.processing, STATUS.shipped, STATUS.delivered];

    return (
        <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto min-h-[70vh]">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">Sipariş Takibi</h1>
            <p className="text-zinc-400 text-center mb-8">Sipariş numaranız ve e-postanızla siparişinizi sorgulayın.</p>

            <form onSubmit={track} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <input
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Sipariş No (AYB-...)"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Sipariş e-postanız"
                    autoCapitalize="none"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold h-12">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-4 h-4 mr-2" /> Sorgula</>}
                </Button>
            </form>

            {order && cfg && (
                <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-zinc-500">Sipariş No</p>
                            <p className="font-mono font-bold text-white">{order.id}</p>
                        </div>
                        <div className={`flex items-center gap-2 ${cfg.color}`}>
                            <cfg.icon className="w-5 h-5" />
                            <span className="font-bold">{cfg.label}</span>
                        </div>
                    </div>

                    {/* Aşama çubuğu */}
                    {order.status !== "cancelled" && (
                        <div className="flex items-center">
                            {steps.map((s, i) => {
                                const active = cfg.step >= s.step;
                                return (
                                    <div key={i} className="flex-1 flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${active ? "bg-yellow-600 text-white" : "bg-zinc-800 text-zinc-600"}`}>
                                            <s.icon className="w-4 h-4" />
                                        </div>
                                        {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${cfg.step > s.step ? "bg-yellow-600" : "bg-zinc-800"}`} />}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="border-t border-white/10 pt-4 space-y-2">
                        {order.items.map((it, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-zinc-300">{it.quantity}× {it.name}</span>
                                <span className="text-white">{formatPrice(it.price * it.quantity)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t border-white/10 font-bold">
                            <span className="text-zinc-400">Toplam</span>
                            <span className="text-yellow-500">{formatPrice(order.total)}</span>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-500 text-center">
                        Sipariş tarihi: {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function OrderTrackPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <Suspense fallback={<div className="pt-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-500" /></div>}>
                <TrackContent />
            </Suspense>
            <Footer />
        </main>
    );
}
