"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { ChevronRight, CreditCard, Lock, CheckCircle, Loader2, Package, Truck, Landmark, Wallet } from "lucide-react";
import { motion } from "framer-motion";

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    notes: string;
}

interface FormErrors {
    [key: string]: string;
}

type PaymentMethod = "cod" | "transfer";

export default function CheckoutPage() {
    const router = useRouter();
    const { state, dispatch } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
    const [errors, setErrors] = useState<FormErrors>({});

    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zipCode: "",
        notes: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = "Ad gerekli";
        if (!formData.lastName.trim()) newErrors.lastName = "Soyad gerekli";
        if (!formData.email.trim()) {
            newErrors.email = "E-posta gerekli";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Geçerli bir e-posta girin";
        }
        if (!formData.phone.trim()) {
            newErrors.phone = "Telefon gerekli";
        } else if (!/^(5\d{9}|0?5\d{9})$/.test(formData.phone.replace(/\D/g, ""))) {
            newErrors.phone = "Geçerli bir telefon numarası girin (5xx xxx xx xx)";
        }
        if (!formData.address.trim()) newErrors.address = "Adres gerekli";
        if (!formData.city.trim()) newErrors.city = "Şehir gerekli";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        zipCode: formData.zipCode || "34000"
                    },
                    items: state.items.map(item => ({
                        id: item.id,
                        name: item.name,
                        category: "Bıçak",
                        price: item.price,
                        quantity: item.quantity
                    })),
                    totalPrice: state.total,
                    paymentMethod,
                    callbackUrl: `${window.location.origin}/checkout/callback`
                })
            });

            const result = await response.json();

            if (result.success) {
                setOrderId(result.orderId);
                setOrderSuccess(true);
                // Clear cart after successful order
                dispatch({ type: "CLEAR_CART" });
            } else {
                alert(result.error || "Sipariş oluşturulamadı");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Empty cart redirect
    if (state.items.length === 0 && !orderSuccess) {
        return (
            <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Package className="w-16 h-16 mx-auto text-zinc-600" />
                    <p className="text-xl">Sepetiniz boş.</p>
                    <Button variant="outline" onClick={() => router.push("/shop")}>
                        Mağazaya Dön
                    </Button>
                </div>
            </main>
        );
    }

    // Order success screen
    if (orderSuccess) {
        return (
            <main className="min-h-screen bg-zinc-950 text-white">
                <Navbar />
                <div className="pt-32 pb-20 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6 max-w-md mx-auto px-4"
                    >
                        <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold">Siparişiniz Alındı!</h1>
                        <p className="text-zinc-400">
                            Siparişiniz başarıyla oluşturuldu. En kısa sürede hazırlanıp kargoya verilecektir.
                        </p>

                        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-2">
                            <p className="text-sm text-zinc-500">Sipariş Numarası</p>
                            <p className="text-lg font-mono font-bold text-white tracking-widest">{orderId}</p>
                        </div>

                        {paymentMethod === "transfer" && (
                            <div className="bg-zinc-900 rounded-xl p-6 border border-yellow-500/20 space-y-4 text-left shadow-lg">
                                <div className="flex items-center gap-2 text-yellow-500 mb-2">
                                    <Landmark className="w-5 h-5" />
                                    <h3 className="font-bold text-sm uppercase tracking-wide">Havale / EFT Bilgileri</h3>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-zinc-400">Banka: <span className="text-white font-medium">Ziraat Bankası</span></p>
                                    <p className="text-zinc-400">Alıcı: <span className="text-white font-medium">Mehmet Yılmaz (Ay Bıçak)</span></p>
                                    <div className="pt-2">
                                        <p className="text-zinc-500 text-xs mb-1">IBAN:</p>
                                        <p className="font-mono text-white text-base font-bold tracking-wider break-all bg-black/20 p-2 rounded border border-white/5 select-all">
                                            TR12 0001 0002 0003 0004 0005 06
                                        </p>
                                    </div>
                                    <p className="text-xs text-yellow-500/80 pt-2 italic">
                                        * Lütfen açıklama kısmına sipariş numaranızı yazınız.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 pt-4">
                            <Button onClick={() => router.push("/shop")} className="w-full">
                                Alışverişe Devam Et
                            </Button>
                            <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                                Ana Sayfaya Dön
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-foreground selection:bg-accent selection:text-black">
            <Navbar />

            <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
                <h1 className="text-3xl font-bold mb-2 font-sans tracking-tight text-white">Ödeme</h1>
                <p className="text-zinc-400 mb-8">Teslimat bilgilerinizi girin ve siparişinizi tamamlayın.</p>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-6">
                                <h2 className="text-xl font-semibold flex items-center gap-3 text-white">
                                    <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold">1</span>
                                    Teslimat Bilgileri
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Input
                                            label="Ad"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            error={errors.firstName}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Soyad"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            error={errors.lastName}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input
                                            label="E-posta"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            error={errors.email}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Telefon"
                                            type="tel"
                                            name="phone"
                                            placeholder="5XX XXX XX XX"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            error={errors.phone}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Adres"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            error={errors.address}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Şehir"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            error={errors.city}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Posta Kodu (Opsiyonel)"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-6">
                                <h2 className="text-xl font-semibold flex items-center gap-3 text-white">
                                    <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold">2</span>
                                    Sipariş Notu (Opsiyonel)
                                </h2>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Özel istekleriniz, isim yazısı, hediye paketi vb."
                                    className="w-full h-24 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                                />
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-6">
                                <h2 className="text-xl font-semibold flex items-center gap-3 text-white">
                                    <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold">3</span>
                                    Ödeme Yöntemi
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* COD Option */}
                                    <div
                                        onClick={() => setPaymentMethod("cod")}
                                        className={`cursor-pointer rounded-xl p-4 border-2 transition-all flex items-start gap-4 ${paymentMethod === "cod" ? "border-white bg-zinc-800" : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"}`}
                                    >
                                        <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === "cod" ? "border-white" : "border-zinc-500"}`}>
                                            {paymentMethod === "cod" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Wallet className="w-4 h-4 text-zinc-300" />
                                                <span className="font-bold text-white">Kapıda Ödeme</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 leading-snug">
                                                Ürünü teslim alırken nakit veya kredi kartı ile ödeme yapabilirsiniz.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Transfer Option */}
                                    <div
                                        onClick={() => setPaymentMethod("transfer")}
                                        className={`cursor-pointer rounded-xl p-4 border-2 transition-all flex items-start gap-4 ${paymentMethod === "transfer" ? "border-white bg-zinc-800" : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"}`}
                                    >
                                        <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === "transfer" ? "border-white" : "border-zinc-500"}`}>
                                            {paymentMethod === "transfer" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Landmark className="w-4 h-4 text-zinc-300" />
                                                <span className="font-bold text-white">Havale / EFT</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 leading-snug">
                                                Sipariş sonrası IBAN bilgilerimize ödeme yapın.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20 flex items-center gap-3">
                                    <Lock className="w-5 h-5 text-green-400" />
                                    <span className="text-sm text-green-400">Tüm işlemler 256-bit SSL sertifikası ile korunmaktadır.</span>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-14 text-lg bg-white text-black hover:bg-zinc-100 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            İşleniyor...
                                        </>
                                    ) : (
                                        <>
                                            Siparişi Tamamla
                                            <ChevronRight className="ml-2 w-5 h-5" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6 sticky top-32">
                                <h3 className="font-semibold text-lg border-b border-zinc-800 pb-4 text-white">Sipariş Özeti</h3>
                                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                    {state.items.map((item) => (
                                        <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between items-start text-sm">
                                            <div className="flex-1 space-y-1">
                                                <span className="block text-white font-medium">{item.name}</span>
                                                {item.selectedSize && (
                                                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-zinc-700 text-zinc-300 uppercase tracking-wider font-medium">
                                                        {item.selectedSize}
                                                    </span>
                                                )}
                                                <span className="block text-zinc-500 text-xs">Adet: {item.quantity}</span>
                                            </div>
                                            <span className="text-zinc-300 font-medium">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-zinc-800 pt-4 space-y-3 text-sm">
                                    <div className="flex justify-between text-zinc-400">
                                        <span>Ara Toplam</span>
                                        <span className="text-white">{formatPrice(state.total)}</span>
                                    </div>
                                    <div className="flex justify-between text-zinc-400">
                                        <span className="flex items-center gap-2">
                                            <Truck className="w-4 h-4" />
                                            Kargo
                                        </span>
                                        <span className="text-green-400 font-medium">Ücretsiz</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-zinc-800">
                                        <span>Toplam</span>
                                        <span>{formatPrice(state.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <Footer />
        </main>
    );
}
