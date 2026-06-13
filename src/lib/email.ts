import crypto from 'node:crypto';
import { Resend } from 'resend';

// Resend istemcisi istek anında oluşturulur; modül yüklenirken API anahtarı
// yoksa build/başlatma çökmesin diye burada new Resend() çağrılmaz.
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
    if (!process.env.RESEND_API_KEY) return null;
    if (!resendClient) {
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
}

export async function sendVerificationEmail(email: string, code: string, name: string) {
    const resend = getResendClient();
    if (!resend) {
        console.error('RESEND_API_KEY tanımlı değil; doğrulama e-postası gönderilemiyor.');
        return { success: false, error: 'E-posta servisi yapılandırılmamış.' };
    }

    try {
        const { data, error } = await resend.emails.send({
            // EMAIL_FROM tanımlanana kadar Resend test domaini kullanılır
            from: process.env.EMAIL_FROM || 'AYBIÇAK <onboarding@resend.dev>',
            to: email,
            subject: 'AYBIÇAK - E-posta Doğrulama Kodu',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="font-size: 28px; margin: 0; color: #fff;">AYBIÇAK</h1>
                        <p style="color: #888; font-size: 14px; margin-top: 8px;">El Yapımı Premium Bıçaklar</p>
                    </div>
                    
                    <div style="background: #18181b; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px; text-align: center;">
                        <p style="color: #ccc; font-size: 16px; margin: 0 0 24px 0;">
                            Merhaba <strong style="color: #fff;">${name}</strong>,
                        </p>
                        <p style="color: #888; font-size: 14px; margin: 0 0 24px 0;">
                            Hesabınızı doğrulamak için aşağıdaki kodu kullanın:
                        </p>
                        
                        <div style="background: linear-gradient(135deg, #ca8a04, #a16207); padding: 20px 40px; border-radius: 12px; display: inline-block; margin: 16px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #fff;">${code}</span>
                        </div>
                        
                        <p style="color: #666; font-size: 12px; margin-top: 24px;">
                            Bu kod 10 dakika içinde geçerliliğini yitirecektir.
                        </p>
                    </div>
                    
                    <p style="color: #666; font-size: 12px; text-align: center; margin-top: 32px;">
                        Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Email send error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, error };
    }
}

export interface OrderEmailData {
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    city: string;
    items: { name: string; quantity: number; price: number }[];
    totalPrice: number;
    paymentMethod: string;
    notes?: string;
}

const paymentMethodLabels: Record<string, string> = {
    cod: 'Kapıda Ödeme',
    transfer: 'Havale / EFT',
    card: 'Kredi Kartı (İyzico)',
};

function formatTRY(amount: number): string {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
}

function buildOrderHtml(order: OrderEmailData, forAdmin: boolean): string {
    const itemRows = order.items
        .map(
            (item) => `
            <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #ccc;">${item.name}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #888; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #fff; text-align: right;">${formatTRY(item.price * item.quantity)}</td>
            </tr>`
        )
        .join('');

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 28px; margin: 0; color: #fff;">AYBIÇAK</h1>
                <p style="color: #888; font-size: 14px; margin-top: 8px;">
                    ${forAdmin ? 'Yeni Sipariş Bildirimi' : 'Siparişiniz Alındı'}
                </p>
            </div>

            <div style="background: #18181b; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px;">
                <p style="color: #ccc; font-size: 14px; margin: 0 0 4px 0;">Sipariş No</p>
                <p style="color: #fff; font-size: 18px; font-weight: bold; margin: 0 0 16px 0; letter-spacing: 1px;">${order.orderId}</p>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                    <thead>
                        <tr>
                            <th style="padding: 8px 12px; text-align: left; color: #888; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.15);">Ürün</th>
                            <th style="padding: 8px 12px; text-align: center; color: #888; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.15);">Adet</th>
                            <th style="padding: 8px 12px; text-align: right; color: #888; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.15);">Tutar</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                </table>

                <p style="text-align: right; color: #fff; font-size: 18px; font-weight: bold; margin: 0 0 16px 0;">
                    Toplam: ${formatTRY(order.totalPrice)}
                </p>

                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; font-size: 13px; color: #aaa; line-height: 1.7;">
                    <p style="margin: 0;"><strong style="color: #ccc;">Ödeme:</strong> ${paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</p>
                    <p style="margin: 0;"><strong style="color: #ccc;">Müşteri:</strong> ${order.customerName} — ${order.customerPhone}</p>
                    <p style="margin: 0;"><strong style="color: #ccc;">Adres:</strong> ${order.address}, ${order.city}</p>
                    ${order.notes ? `<p style="margin: 0;"><strong style="color: #ccc;">Not:</strong> ${order.notes}</p>` : ''}
                </div>
            </div>

            <p style="color: #666; font-size: 12px; text-align: center; margin-top: 32px;">
                ${forAdmin
                    ? `Müşteri e-postası: ${order.customerEmail}`
                    : 'Siparişiniz en kısa sürede hazırlanıp kargoya verilecektir. Sorularınız için bu e-postayı yanıtlayabilirsiniz.'}
            </p>
        </div>
    `;
}

// Sipariş onayını müşteriye, bildirimi ORDER_NOTIFY_EMAIL adresine gönderir.
// E-posta servisi yapılandırılmamışsa sipariş akışını bozmaz, sadece loglar.
export async function sendOrderEmails(order: OrderEmailData) {
    const resend = getResendClient();
    if (!resend) {
        console.warn('RESEND_API_KEY tanımlı değil; sipariş e-postaları gönderilemedi.', order.orderId);
        return { success: false };
    }

    const from = process.env.EMAIL_FROM || 'AYBIÇAK <onboarding@resend.dev>';
    const results = await Promise.allSettled([
        resend.emails.send({
            from,
            to: order.customerEmail,
            subject: `Siparişiniz Alındı — ${order.orderId}`,
            html: buildOrderHtml(order, false),
        }),
        ...(process.env.ORDER_NOTIFY_EMAIL
            ? [
                resend.emails.send({
                    from,
                    to: process.env.ORDER_NOTIFY_EMAIL,
                    subject: `Yeni Sipariş — ${order.orderId} (${formatTRY(order.totalPrice)})`,
                    html: buildOrderHtml(order, true),
                }),
            ]
            : []),
    ]);

    results.forEach((r) => {
        if (r.status === 'rejected') console.error('Order email error:', r.reason);
    });

    return { success: results.some((r) => r.status === 'fulfilled') };
}

export function generateVerificationCode(): string {
    // Math.random tahmin edilebilir olduğu için kriptografik rastgelelik kullanılır
    return crypto.randomInt(100000, 1000000).toString();
}
