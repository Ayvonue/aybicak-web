import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/auth';
import { authenticateUser } from '@/lib/users';
import { createCustomerToken, CUSTOMER_COOKIE } from '@/lib/customerSession';

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
            return NextResponse.json(
                { error: 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'E-posta ve şifre zorunludur.' },
                { status: 400 }
            );
        }

        // Kullanıcı bulunamasa da aynı hata mesajı döner (hesap varlığı sızdırılmaz)
        const user = await authenticateUser(email, password);
        if (!user) {
            return NextResponse.json(
                { error: 'E-posta veya şifre hatalı.' },
                { status: 401 }
            );
        }

        const res = NextResponse.json({ success: true, user });
        res.cookies.set(CUSTOMER_COOKIE, await createCustomerToken(user.email), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60,
        });
        return res;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
            { status: 500 }
        );
    }
}
