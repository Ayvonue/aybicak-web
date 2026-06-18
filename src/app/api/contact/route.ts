import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';
import { rateLimit } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!rateLimit(`contact:${ip}`, 5, 15 * 60 * 1000)) {
            return NextResponse.json(
                { error: 'Çok fazla mesaj gönderildi. Lütfen daha sonra tekrar deneyin.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { name, email, phone, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Ad, e-posta ve mesaj zorunludur.' },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Geçerli bir e-posta adresi girin.' },
                { status: 400 }
            );
        }

        if (String(message).length > 5000) {
            return NextResponse.json(
                { error: 'Mesaj çok uzun.' },
                { status: 400 }
            );
        }

        const result = await sendContactEmail({ name, email, phone, message });
        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Mesaj gönderilemedi.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Mesajınız alındı. En kısa sürede dönüş yapacağız.' });
    } catch (error) {
        console.error('Contact route error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
    }
}
