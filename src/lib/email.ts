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

export function generateVerificationCode(): string {
    // Math.random tahmin edilebilir olduğu için kriptografik rastgelelik kullanılır
    return crypto.randomInt(100000, 1000000).toString();
}
