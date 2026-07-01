import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";
import { rateLimit } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        if (!rateLimit(`coupon:${ip}`, 20, 15 * 60 * 1000)) {
            return NextResponse.json({ valid: false, error: "Çok fazla deneme." }, { status: 429 });
        }
        const { code, subtotal } = await request.json();
        const result = await validateCoupon(String(code || ""), Number(subtotal) || 0);
        return NextResponse.json(result, { status: result.valid ? 200 : 400 });
    } catch {
        return NextResponse.json({ valid: false, error: "Bir hata oluştu." }, { status: 500 });
    }
}
