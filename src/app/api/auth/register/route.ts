import { NextResponse } from 'next/server';
import { sendVerificationEmail, generateVerificationCode } from '@/lib/email';

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
        const body = await request.json();
        const { name, surname, email, phone, password, birthDate, gender } = body;

        // Validate required fields
        if (!name || !surname || !email || !password) {
            return NextResponse.json(
                { error: 'Ad, soyad, e-posta ve şifre zorunludur.' },
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

        // Store pending registration
        pendingRegistrations.set(email, {
            code,
            expires,
            userData: { name, surname, email, phone, password, birthDate, gender }
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
