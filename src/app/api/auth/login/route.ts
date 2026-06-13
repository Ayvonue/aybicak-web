import { NextResponse } from 'next/server';
import { verifiedUsers } from '../verify/route';
import { verifyPassword, rateLimit } from '@/lib/auth';

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

        const user = verifiedUsers.get(email);

        // Kullanıcı bulunamasa da aynı hata mesajı döner (hesap varlığı sızdırılmaz)
        if (!user || !verifyPassword(password, user.password)) {
            return NextResponse.json(
                { error: 'E-posta veya şifre hatalı.' },
                { status: 401 }
            );
        }

        const userWithoutPassword = {
            name: user.name,
            surname: user.surname,
            email: user.email,
            phone: user.phone,
            birthDate: user.birthDate,
            gender: user.gender,
            createdAt: user.createdAt,
        };

        return NextResponse.json({
            success: true,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
            { status: 500 }
        );
    }
}
