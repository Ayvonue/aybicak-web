import { NextResponse } from "next/server";
import { createAdminToken, ADMIN_COOKIE } from "@/lib/adminSession";
import { rateLimit } from "@/lib/auth";
import crypto from "node:crypto";

// Sabit zamanlı string karşılaştırma (kullanıcı adı/şifre sızıntısını azaltır)
function safeEqual(a: string, b: string): boolean {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
}

export async function POST(request: Request) {
    try {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        if (!rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000)) {
            return NextResponse.json(
                { error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." },
                { status: 429 }
            );
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const secret = process.env.ADMIN_SESSION_SECRET;

        if (!adminEmail || !adminPassword || !secret) {
            return NextResponse.json(
                { error: "Admin girişi yapılandırılmamış. (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET gerekli.)" },
                { status: 503 }
            );
        }

        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json({ error: "E-posta ve şifre zorunludur." }, { status: 400 });
        }

        // Mobil klavye/yapıştırma kaynaklı baş-son boşlukları temizle
        const ok =
            safeEqual(String(email).trim().toLowerCase(), adminEmail.trim().toLowerCase()) &&
            safeEqual(String(password).trim(), adminPassword.trim());

        if (!ok) {
            return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
        }

        const token = await createAdminToken(adminEmail);
        const res = NextResponse.json({ success: true });
        res.cookies.set(ADMIN_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 8 * 60 * 60,
        });
        return res;
    } catch (error) {
        console.error("Admin login error:", error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
