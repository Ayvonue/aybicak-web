import { NextResponse } from "next/server";
import { getOrderByIdAndEmail } from "@/lib/orders";
import { rateLimit } from "@/lib/auth";

// Sipariş no + e-posta ile güvenli takip (ikisi de doğru olmalı)
export async function POST(request: Request) {
    try {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        if (!rateLimit(`track:${ip}`, 15, 15 * 60 * 1000)) {
            return NextResponse.json({ error: "Çok fazla sorgu." }, { status: 429 });
        }
        const { orderId, email } = await request.json();
        if (!orderId || !email) {
            return NextResponse.json({ error: "Sipariş no ve e-posta zorunludur." }, { status: 400 });
        }
        const order = await getOrderByIdAndEmail(String(orderId).trim(), String(email).trim());
        if (!order) {
            return NextResponse.json({ error: "Sipariş bulunamadı. Bilgileri kontrol edin." }, { status: 404 });
        }
        return NextResponse.json({
            order: {
                id: order.id,
                status: order.status,
                total: order.total,
                createdAt: order.createdAt,
                items: order.items,
                paymentMethod: order.paymentMethod,
            },
        });
    } catch {
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
