import { NextResponse } from 'next/server';
import { sendNewsletterNotification } from '@/lib/email';
import { rateLimit } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!rateLimit(`newsletter:${ip}`, 5, 15 * 60 * 1000)) {
            return NextResponse.json(
                { error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { email } = body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Geçerli bir e-posta adresi girin.' },
                { status: 400 }
            );
        }

        const result = await sendNewsletterNotification(email);
        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Abonelik kaydedilemedi.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Newsletter route error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
    }
}
