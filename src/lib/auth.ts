import crypto from 'node:crypto';

// Şifreler scrypt ile tuzlanarak hash'lenir; düz metin asla saklanmaz.
export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const candidate = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), candidate);
}

// Basit in-memory rate limiter. Sunucu yeniden başlayınca sıfırlanır;
// kalıcı altyapı (ör. Upstash/Redis) eklenene kadar temel koruma sağlar.
const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = attempts.get(key);

    if (!entry || entry.resetAt < now) {
        attempts.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (entry.count >= maxAttempts) return false;

    entry.count += 1;
    return true;
}
