import { NextResponse } from "next/server";
import { createReview } from "@/lib/reviews";
import { rateLimit } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        if (!rateLimit(`review:${ip}`, 8, 15 * 60 * 1000)) {
            return NextResponse.json({ error: "Çok fazla değerlendirme gönderildi." }, { status: 429 });
        }
        const { productId, name, rating, comment } = await request.json();
        if (!productId || !name || !rating) {
            return NextResponse.json({ error: "Ürün, isim ve puan zorunludur." }, { status: 400 });
        }
        const ok = await createReview({ productId, name, rating, comment });
        if (!ok) return NextResponse.json({ error: "Değerlendirme kaydedilemedi." }, { status: 400 });
        return NextResponse.json({ success: true, message: "Değerlendirmeniz için teşekkürler!" });
    } catch (e) {
        console.error("Review route error:", e);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
