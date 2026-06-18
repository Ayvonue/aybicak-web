"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Loader2 } from "lucide-react";

export default function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Geçerli bir e-posta adresi girin.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Abonelik kaydedilemedi.");
                return;
            }
            setSubscribed(true);
        } catch {
            setError("Bağlantı hatası. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    if (subscribed) {
        return (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Aboneliğiniz alındı, teşekkürler!
            </div>
        );
    }

    return (
        <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
            <div className="relative group">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="E-posta adresiniz"
                    aria-label="E-posta adresiniz"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-600/50 transition-colors"
                />
                <div className="absolute inset-0 rounded-lg bg-yellow-600/20 opacity-0 group-hover:opacity-100 blur transition-opacity -z-10" />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button type="submit" disabled={loading} variant="premium" className="w-full font-bold text-white disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Abone Ol"}
            </Button>
        </form>
    );
}
