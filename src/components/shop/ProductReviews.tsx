"use client";

import { useState } from "react";
import { Star, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Review } from "@/lib/reviews";

function Stars({ value, size = "w-4 h-4" }: { value: number; size?: string }) {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`${size} ${n <= Math.round(value) ? "fill-yellow-500 text-yellow-500" : "text-zinc-600"}`} />
            ))}
        </div>
    );
}

export default function ProductReviews({
    productId,
    initialReviews,
    average,
    count,
}: {
    productId: string;
    initialReviews: Review[];
    average: number;
    count: number;
}) {
    const [reviews, setReviews] = useState(initialReviews);
    const [name, setName] = useState("");
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError("Lütfen adınızı girin."); return; }
        setLoading(true); setError("");
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, name, rating, comment }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Gönderilemedi."); return; }
            // İyimser ekleme
            setReviews((prev) => [
                { id: Date.now(), productId, name: name.trim(), rating, comment: comment.trim() || null, createdAt: new Date().toISOString() },
                ...prev,
            ]);
            setSent(true);
        } catch {
            setError("Bağlantı hatası.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-white/5">
            <div className="flex items-center gap-4 mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Değerlendirmeler</h2>
                {count > 0 && (
                    <div className="flex items-center gap-2">
                        <Stars value={average} />
                        <span className="text-sm text-zinc-400">{average.toFixed(1)} ({count})</span>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Yorum listesi */}
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <p className="text-zinc-500 text-sm">Henüz değerlendirme yok. İlk yorumu siz yapın!</p>
                    ) : (
                        reviews.map((r) => (
                            <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-white text-sm">{r.name}</span>
                                    <Stars value={r.rating} size="w-3.5 h-3.5" />
                                </div>
                                {r.comment && <p className="text-sm text-zinc-400 leading-relaxed">{r.comment}</p>}
                                <p className="text-[11px] text-zinc-600 mt-2">{new Date(r.createdAt).toLocaleDateString("tr-TR")}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Yorum formu */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
                    {sent ? (
                        <div className="text-center space-y-2 py-4">
                            <CheckCircle className="w-10 h-10 mx-auto text-green-400" />
                            <p className="text-white font-medium">Değerlendirmeniz için teşekkürler!</p>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-4">
                            <h3 className="font-bold text-white">Ürünü Değerlendir</h3>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} aria-label={`${n} yıldız`}>
                                        <Star className={`w-7 h-7 transition-colors ${n <= (hover || rating) ? "fill-yellow-500 text-yellow-500" : "text-zinc-600"}`} />
                                    </button>
                                ))}
                            </div>
                            <input
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(""); }}
                                placeholder="Adınız"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-500"
                            />
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Yorumunuz (opsiyonel)"
                                className="w-full h-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-500 resize-none"
                            />
                            {error && <p className="text-sm text-red-400">{error}</p>}
                            <Button type="submit" disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gönder"}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
