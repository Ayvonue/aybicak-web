import { NextResponse } from 'next/server';
import { sendVerificationEmail, generateVerificationCode } from '@/lib/email';
import { hashPassword, rateLimit } from '@/lib/auth';

// In-memory store for pending registrations (in production, use a database)
// This is exported so verify route can access it
export const pendingRegistrations = new Map<string, {
    code: string;
    expires: number;
    userData: {
        name: string;
        surname: string;
        email: string;
        phone: string;
        password: string;
        birthDate?: string;
        gender?: string;
    };
}>();

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!rateLimit(`register:${ip}`, 5, 15 * 60 * 1000)) {
            return NextResponse.json(
                { error: 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { name, surname, email, phone, password, birthDate, gender } = body;

        // Validate required fields
        if (!name || !surname || !email || !password) {
            return NextResponse.json(
                { error: 'Ad, soyad, e-posta ve şifre zorunludur.' },
                { status: 400 }
            );
        }

        // IP rotasyonuyla aynı e-postaya doğrulama maili spam'ini engelle
        if (!rateLimit(`register-email:${email}`, 3, 60 * 60 * 1000)) {
            return NextResponse.json(
                { error: 'Bu e-posta için çok fazla kayıt denemesi yapıldı. Lütfen daha sonra tekrar deneyin.' },
                { status: 429 }
            );
        }

        if (typeof password !== 'string' || password.length < 6) {
            return NextResponse.json(
                { error: 'Şifre en az 6 karakter olmalıdır.' },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Geçerli bir e-posta adresi girin.' },
                { status: 400 }
            );
        }

        // Check if email is already pending verification
        if (pendingRegistrations.has(email)) {
            const existing = pendingRegistrations.get(email)!;
            if (existing.expires > Date.now()) {
                return NextResponse.json(
                    { error: 'Bu e-posta için zaten bir doğrulama kodu gönderildi. Lütfen e-postanızı kontrol edin.' },
                    { status: 400 }
                );
            }
            // If expired, remove it
            pendingRegistrations.delete(email);
        }

        // Generate verification code
        const code = generateVerificationCode();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store pending registration (şifre hash'lenerek saklanır)
        pendingRegistrations.set(email, {
            code,
            expires,
            userData: { name, surname, email, phone, password: hashPassword(password), birthDate, gender }
        });

        // Send verification email
        const emailResult = await sendVerificationEmail(email, code, name);

        if (!emailResult.success) {
            pendingRegistrations.delete(email);
            return NextResponse.json(
                { error: 'E-posta gönderilemedi. Lütfen tekrar deneyin.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Doğrulama kodu e-posta adresinize gönderildi.',
            email: email
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
            { status: 500 }
        );
    }
}
