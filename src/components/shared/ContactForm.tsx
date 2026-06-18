"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Loader2, Send } from "lucide-react";

export default function ContactForm() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.message.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setError("Lütfen ad, geçerli e-posta ve mesaj alanlarını doldurun.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Mesaj gönderilemedi.");
                return;
            }
            setSent(true);
        } catch {
            setError("Bağlantı hatası. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 mx-auto text-green-400" />
                <h3 className="text-xl font-bold text-white">Mesajınız Alındı</h3>
                <p className="text-zinc-400 text-sm">En kısa sürede size dönüş yapacağız. Teşekkür ederiz.</p>
            </div>
        );
    }

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-600/50 transition-colors";

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-2">Bize Yazın</h2>
            <p className="text-sm text-zinc-400 mb-4">Özel sipariş, toptan alım veya sorularınız için formu doldurun.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    className={inputClass}
                    placeholder="Adınız Soyadınız *"
                    aria-label="Ad Soyad"
                    value={form.name}
                    onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(""); }}
                />
                <input
                    className={inputClass}
                    type="email"
                    placeholder="E-posta adresiniz *"
                    aria-label="E-posta"
                    value={form.email}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(""); }}
                />
            </div>
            <input
                className={inputClass}
                type="tel"
                placeholder="Telefon (opsiyonel)"
                aria-label="Telefon"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <textarea
                className={`${inputClass} h-32 resize-none`}
                placeholder="Mesajınız *"
                aria-label="Mesaj"
                value={form.message}
                onChange={(e) => { setForm({ ...form, message: e.target.value }); setError(""); }}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={loading} variant="premium" className="w-full font-bold text-white disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Gönder</>}
            </Button>
        </form>
    );
}
