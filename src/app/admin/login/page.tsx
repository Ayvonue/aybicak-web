"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

function LoginForm() {
    const router = useRouter();
    const params = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Giriş yapılamadı.");
                return;
            }
            const from = params.get("from") || "/admin";
            router.push(from);
            router.refresh();
        } catch {
            setError("Bağlantı hatası. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all";

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-yellow-600/20 flex items-center justify-center">
                        <ShieldCheck className="w-7 h-7 text-yellow-500" />
                    </div>
                    <h1 className="text-2xl font-bold">Ay Bıçak Yönetim</h1>
                    <p className="text-sm text-zinc-500 mt-1">Devam etmek için giriş yapın</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-[#18181b] border border-white/10 rounded-2xl p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                    <div className="relative">
                        <input
                            type="email"
                            required
                            className={inputClass}
                            placeholder="admin@aybicak.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            required
                            className={inputClass}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 font-bold bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl disabled:opacity-50">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Giriş Yap"}
                    </Button>
                </form>
                <p className="text-center text-xs text-zinc-600 mt-4">Yetkisiz erişim kayıt altına alınır.</p>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
