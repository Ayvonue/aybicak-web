import { NextResponse } from 'next/server';
import { pendingRegistrations } from '../register/route';
import { rateLimit } from '@/lib/auth';
import { createUser } from '@/lib/users';
import { createCustomerToken, CUSTOMER_COOKIE } from '@/lib/customerSession';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, code } = body;

        // Validate required fields
        if (!email || !code) {
            return NextResponse.json(
                { error: 'E-posta ve doğrulama kodu zorunludur.' },
                { status: 400 }
            );
        }

        // 6 haneli kodun denenerek bulunmasını engelle
        if (!rateLimit(`verify:${email}`, 5, 10 * 60 * 1000)) {
            return NextResponse.json(
                { error: 'Çok fazla hatalı deneme. Lütfen daha sonra tekrar deneyin.' },
                { status: 429 }
            );
        }

        // Check if there's a pending registration
        const pending = pendingRegistrations.get(email);

        if (!pending) {
            return NextResponse.json(
                { error: 'Bu e-posta için bekleyen bir kayıt bulunamadı.' },
                { status: 404 }
            );
        }

        // Check if code is expired
        if (pending.expires < Date.now()) {
            pendingRegistrations.delete(email);
            return NextResponse.json(
                { error: 'Doğrulama kodu süresi dolmuş. Lütfen tekrar kayıt olun.' },
                { status: 400 }
            );
        }

        // Check if code matches
        if (pending.code !== code) {
            return NextResponse.json(
                { error: 'Geçersiz doğrulama kodu.' },
                { status: 400 }
            );
        }

        // Kalıcı kullanıcıyı veritabanına yaz (şifre zaten hash'li)
        const ud = pending.userData;
        await createUser({
            name: ud.name,
            surname: ud.surname,
            email: ud.email,
            phone: ud.phone,
            passwordHash: ud.password,
            birthDate: ud.birthDate,
            gender: ud.gender,
        });
        pendingRegistrations.delete(email);

        // Return user data (without password)
        const { password, ...userWithoutPassword } = pending.userData;

        const res = NextResponse.json({
            success: true,
            message: 'Hesabınız başarıyla doğrulandı!',
            user: userWithoutPassword
        });
        res.cookies.set(CUSTOMER_COOKIE, await createCustomerToken(ud.email), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60,
        });
        return res;

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
            { status: 500 }
        );
    }
}
