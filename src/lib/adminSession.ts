// Admin oturumu: HMAC-SHA256 imzalı çerez. Web Crypto kullanır; hem Node
// (API route) hem Edge (middleware) ortamında çalışır.

const encoder = new TextEncoder();

function bytesToB64Url(bytes: Uint8Array): string {
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64UrlToString(b64: string): string {
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const norm = b64.replace(/-/g, "+").replace(/_/g, "/") + pad;
    return atob(norm);
}

function getSecret(): string {
    // Üretimde ADMIN_SESSION_SECRET zorunludur; yoksa oturum üretilemez.
    return process.env.ADMIN_SESSION_SECRET || "";
}

async function hmac(data: string): Promise<string> {
    const secret = getSecret();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    return bytesToB64Url(new Uint8Array(sig));
}

export const ADMIN_COOKIE = "admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 saat

// İmzalı oturum jetonu üret: base64url(payload).imza
export async function createAdminToken(email: string): Promise<string> {
    const payload = JSON.stringify({ e: email, x: Date.now() + SESSION_TTL_MS });
    const payloadB64 = bytesToB64Url(encoder.encode(payload));
    const sig = await hmac(payloadB64);
    return `${payloadB64}.${sig}`;
}

// Jetonu doğrula (imza + son kullanma). Geçerliyse admin e-postasını döner.
export async function verifyAdminToken(token: string | undefined): Promise<string | null> {
    if (!token || !getSecret()) return null;
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;

    const expected = await hmac(payloadB64);
    if (expected !== sig) return null;

    try {
        const payload = JSON.parse(b64UrlToString(payloadB64)) as { e: string; x: number };
        if (typeof payload.x !== "number" || payload.x < Date.now()) return null;
        return payload.e;
    } catch {
        return null;
    }
}
