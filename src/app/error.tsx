"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({ error, reset }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Page error:", error);
    }, [error]);

    return (
        <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
            <div className="text-center space-y-6 max-w-md">
                <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-3xl font-bold">Bir Şeyler Ters Gitti</h1>
                <p className="text-zinc-400">
                    Beklenmedik bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin; sorun devam ederse bizimle iletişime geçin.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={reset} className="bg-white text-black hover:bg-zinc-200 font-bold">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Tekrar Dene
                    </Button>
                    <Link href="/">
                        <Button variant="outline" className="w-full">Ana Sayfaya Dön</Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
