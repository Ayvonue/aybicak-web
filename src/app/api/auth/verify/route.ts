import { NextResponse } from 'next/server';
import { pendingRegistrations } from '../register/route';

// In-memory store for verified users (in production, use a database)
export const verifiedUsers = new Map<string, {
    name: string;
    surname: string;
    email: string;
    phone: string;
    password: string;
    birthDate?: string;
    gender?: string;
    createdAt: number;
}>();

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

        // Move user from pending to verified
        verifiedUsers.set(email, {
            ...pending.userData,
            createdAt: Date.now()
        });
        pendingRegistrations.delete(email);

        // Return user data (without password)
        const { password, ...userWithoutPassword } = pending.userData;

        return NextResponse.json({
            success: true,
            message: 'Hesabınız başarıyla doğrulandı!',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
            { status: 500 }
        );
    }
}
