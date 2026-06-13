"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function ResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { dispatch } = useCart();

    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");
    const isSuccess = status === "success";

    // Ödeme başarılıysa sepet temizlenir
    useEffect(() => {
        if (isSuccess) {
            dispatch({ type: "CLEAR_CART" });
        }
    }, [isSuccess, dispatch]);

    return (
        <div className="pt-32 pb-20 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md mx-auto px-4">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${isSuccess ? "bg-green-500/20" : "bg-red-500/20"}`}>
                    {isSuccess
                        ? <CheckCircle className="w-10 h-10 text-green-500" />
                        : <XCircle className="w-10 h-10 text-red-400" />}
                </div>
                <h1 className="text-3xl font-bold">
                    {isSuccess ? "Ödemeniz Alındı!" : "Ödeme Tamamlanamadı"}
                </h1>
                <p className="text-zinc-400">
                    {isSuccess
                        ? "Siparişiniz başarıyla oluşturuldu. En kısa sürede hazırlanıp kargoya verilecektir."
                        : "Ödeme işlemi tamamlanamadı. Kart bilgilerinizi kontrol edip tekrar deneyebilir veya farklı bir ödeme yöntemi seçebilirsiniz."}
                </p>

                {isSuccess && orderId && (
                    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-2">
                        <p className="text-sm text-zinc-500">Sipariş Numarası</p>
                        <p className="text-lg font-mono font-bold text-white tracking-widest">{orderId}</p>
                    </div>
                )}

                <div className="flex flex-col gap-3 pt-4">
                    {isSuccess ? (
                        <Button onClick={() => router.push("/shop")} className="w-full">
                            Alışverişe Devam Et
                        </Button>
                    ) : (
                        <Button onClick={() => router.push("/checkout")} className="w-full">
                            Tekrar Dene
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                        Ana Sayfaya Dön
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutResultPage() {
    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <Navbar />
            <Suspense fallback={
                <div className="pt-32 pb-20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                </div>
            }>
                <ResultContent />
            </Suspense>
        </main>
    );
}
