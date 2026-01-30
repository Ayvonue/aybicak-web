"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Mail, Lock, Calendar, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import { useAuth, User as UserType } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: "login" | "register";
}

type Step = "form" | "verify" | "success";

export default function AuthModal({ isOpen, onClose, initialTab = "login" }: AuthModalProps) {
    const { login } = useAuth();
    const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState<Step>("form");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [pendingEmail, setPendingEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);

    // Register Form State
    const [registerData, setRegisterData] = useState({
        name: "",
        surname: "",
        email: "",
        phone: "",
        password: "",
        birthDate: "",
        gender: "",
        kvkk: false
    });

    // Login Form State
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const resetForm = () => {
        setStep("form");
        setError("");
        setPendingEmail("");
        setVerificationCode(["", "", "", "", "", ""]);
        setRegisterData({
            name: "",
            surname: "",
            email: "",
            phone: "",
            password: "",
            birthDate: "",
            gender: "",
            kvkk: false
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerData)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Bir hata oluştu.");
                return;
            }

            // Success - move to verification step
            setPendingEmail(registerData.email);
            setStep("verify");
        } catch (err) {
            setError("Bağlantı hatası. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        const code = verificationCode.join("");
        if (code.length !== 6) {
            setError("Lütfen 6 haneli kodu girin.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: pendingEmail, code })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Doğrulama başarısız.");
                return;
            }

            // Success - log the user in
            const newUser: UserType = {
                name: data.user.name,
                surname: data.user.surname,
                email: data.user.email,
                phone: data.user.phone,
                birthDate: data.user.birthDate,
                gender: data.user.gender,
                registeredAt: new Date().toISOString()
            };
            login(newUser);
            setStep("success");

            // Close modal after a short delay
            setTimeout(() => {
                onClose();
                resetForm();
            }, 2000);
        } catch (err) {
            setError("Bağlantı hatası. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only single digit
        if (!/^\d*$/.test(value)) return; // Only numbers

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login logic - in real app, validate against backend
        const demoUser: UserType = {
            name: "Misafir",
            surname: "Kullanıcı",
            email: loginData.email,
            phone: "",
            registeredAt: new Date().toISOString()
        };
        login(demoUser);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-4 z-[70]"
                    >
                        <div className="bg-[#18181B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-500/10 rounded-full blur-[50px] pointer-events-none" />

                            <button
                                onClick={() => { onClose(); resetForm(); }}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-20"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Verification Step */}
                            {step === "verify" && (
                                <div className="p-8 relative z-10">
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Mail className="w-8 h-8 text-yellow-500" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white mb-2">E-posta Doğrulaması</h2>
                                        <p className="text-sm text-zinc-400">
                                            <span className="text-white font-medium">{pendingEmail}</span> adresine 6 haneli doğrulama kodu gönderdik.
                                        </p>
                                    </div>

                                    <div className="flex justify-center gap-2 mb-6">
                                        {verificationCode.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`code-${index}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                                onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                                className="w-12 h-14 bg-black/40 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                                            />
                                        ))}
                                    </div>

                                    {error && (
                                        <p className="text-red-400 text-sm text-center mb-4">{error}</p>
                                    )}

                                    <Button
                                        onClick={handleVerify}
                                        disabled={loading || verificationCode.join("").length !== 6}
                                        className="w-full font-bold h-12 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Doğrula"}
                                    </Button>

                                    <p className="text-xs text-zinc-500 text-center mt-4">
                                        Kod almadınız mı?{" "}
                                        <button
                                            onClick={() => { setStep("form"); }}
                                            className="text-yellow-500 hover:underline"
                                        >
                                            Tekrar gönder
                                        </button>
                                    </p>
                                </div>
                            )}

                            {/* Success Step */}
                            {step === "success" && (
                                <div className="p-8 relative z-10 text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
                                    >
                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                    </motion.div>
                                    <h2 className="text-xl font-bold text-white mb-2">Hoş Geldiniz!</h2>
                                    <p className="text-sm text-zinc-400">Hesabınız başarıyla oluşturuldu. %5 indiriminiz aktif!</p>
                                </div>
                            )}

                            {/* Form Step */}
                            {step === "form" && (
                                <>
                                    {/* Tabs */}
                                    <div className="flex border-b border-white/10 relative z-10 bg-black/20">
                                        <button
                                            onClick={() => setActiveTab("login")}
                                            className={cn(
                                                "flex-1 py-4 text-sm font-bold transition-all relative",
                                                activeTab === "login" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                                            )}
                                        >
                                            Giriş Yap
                                            {activeTab === "login" && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("register")}
                                            className={cn(
                                                "flex-1 py-4 text-sm font-bold transition-all relative",
                                                activeTab === "register" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                                            )}
                                        >
                                            Üye Ol
                                            {activeTab === "register" && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />}
                                        </button>
                                    </div>

                                    <div className="p-6 overflow-y-auto custom-scrollbar relative z-10">
                                        {error && (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                                                <p className="text-red-400 text-sm">{error}</p>
                                            </div>
                                        )}

                                        {activeTab === "login" ? (
                                            <form onSubmit={handleLogin} className="space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs text-zinc-500 font-medium ml-1">E-Posta Adresi</label>
                                                    <div className="relative">
                                                        <input
                                                            required
                                                            type="email"
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                                                            placeholder="ornek@email.com"
                                                            value={loginData.email}
                                                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                                        />
                                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs text-zinc-500 font-medium ml-1">Şifre</label>
                                                    <div className="relative">
                                                        <input
                                                            required
                                                            type={showPassword ? "text" : "password"}
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                                                            placeholder="••••••••"
                                                            value={loginData.password}
                                                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                                        />
                                                        <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                                                        >
                                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-zinc-500">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="rounded border-zinc-700 bg-black/40" />
                                                        Beni Hatırla
                                                    </label>
                                                    <a href="#" className="hover:text-yellow-500 transition-colors">Şifremi Unuttum</a>
                                                </div>

                                                <Button size="lg" className="w-full font-bold h-12 rounded-xl bg-white text-black hover:bg-zinc-200 mt-2">
                                                    Giriş Yap
                                                </Button>
                                            </form>
                                        ) : (
                                            <form onSubmit={handleRegister} className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-xs text-zinc-500 font-medium ml-1">Ad</label>
                                                        <div className="relative">
                                                            <input
                                                                required
                                                                type="text"
                                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                                                                placeholder="Adınız"
                                                                value={registerData.name}
                                                                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                                            />
                                                            <User className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs text-zinc-500 font-medium ml-1">Soyad</label>
                                                        <div className="relative">
                                                            <input
                                                                required
                                                                type="text"
                                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                                                                placeholder="Soyadınız"
                                                                value={registerData.surname}
                                                                onChange={(e) => setRegisterData({ ...registerData, surname: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs text-zinc-500 font-medium ml-1">E-Posta</label>
                                                    <div className="relative">
                                                        <input
                                                            required
                                                            type="email"
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                                                            placeholder="ornek@email.com"
                                                            value={registerData.email}
                                                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                                        />
                                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs text-zinc-500 font-medium ml-1">Telefon</label>
                                                    <div className="relative">
                                                        <input
                                                            required
                                                            type="tel"
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                                                            placeholder="0555 555 55 55"
                                                            value={registerData.phone}
                                                            onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                                        />
                                                        <Phone className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs text-zinc-500 font-medium ml-1">Şifre</label>
                                                    <div className="relative">
                                                        <input
                                                            required
                                                            type={showPassword ? "text" : "password"}
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                                                            placeholder="••••••••"
                                                            value={registerData.password}
                                                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                                        />
                                                        <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                                                        >
                                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-xs text-zinc-500 font-medium ml-1">Doğum Tarihi</label>
                                                        <div className="relative">
                                                            <input
                                                                type="date"
                                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all min-h-[46px]"
                                                                value={registerData.birthDate}
                                                                onChange={(e) => setRegisterData({ ...registerData, birthDate: e.target.value })}
                                                            />
                                                            <Calendar className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs text-zinc-500 font-medium ml-1">Cinsiyet</label>
                                                        <select
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all appearance-none cursor-pointer"
                                                            value={registerData.gender}
                                                            onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
                                                        >
                                                            <option value="" className="bg-zinc-900 text-zinc-500">Seçiniz</option>
                                                            <option value="male" className="bg-zinc-900">Erkek</option>
                                                            <option value="female" className="bg-zinc-900">Kadın</option>
                                                            <option value="other" className="bg-zinc-900">Belirtmek İstemiyorum</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                                                    <div className="mt-0.5">
                                                        <input
                                                            required
                                                            type="checkbox"
                                                            className="rounded border-zinc-700 bg-black/40 text-yellow-500 focus:ring-yellow-500"
                                                            checked={registerData.kvkk}
                                                            onChange={(e) => setRegisterData({ ...registerData, kvkk: e.target.checked })}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-zinc-400 leading-tight">
                                                        <a href="#" className="underline hover:text-white">Üyelik Sözleşmesi</a>'ni ve <a href="#" className="underline hover:text-white">KVKK Aydınlatma Metni</a>'ni okudum, onaylıyorum.
                                                    </p>
                                                </div>

                                                <Button
                                                    size="lg"
                                                    disabled={loading}
                                                    className="w-full font-bold h-12 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white mt-2 disabled:opacity-50"
                                                >
                                                    {loading ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        "Üye Ol ve %5 İndirim Kazan"
                                                    )}
                                                </Button>
                                            </form>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
