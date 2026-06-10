"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";

const STORAGE_KEY = "aybicak-newsletter";

export default function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [error, setError] = useState("");

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Geçerli bir e-posta adresi girin.");
            return;
        }
        // Backend bülten servisi eklenene kadar abonelik tercihi yerelde tutulur
        localStorage.setItem(STORAGE_KEY, email);
        setSubscribed(true);
        setError("");
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
            <Button type="submit" variant="premium" className="w-full font-bold text-white">
                Abone Ol
            </Button>
        </form>
    );
}
