// Müşteri oturumu: HMAC-SHA256 imzalı httpOnly çerez (admin ile aynı desen,
// ayrı çerez adı). İmza anahtarı olarak ADMIN_SESSION_SECRET kullanılır.

const encoder = new TextEncoder();

function bytesToB64Url(bytes: Uint8Array): string {
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64UrlToString(b64: string): string {
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    return atob(b64.replace(/-/g, "+").replace(/_/g, "/") + pad);
}
function getSecret(): string {
    return process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "";
}
async function hmac(data: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        "raw", encoder.encode(getSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    return bytesToB64Url(new Uint8Array(sig));
}

export const CUSTOMER_COOKIE = "customer_session";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 gün

export async function createCustomerToken(email: string): Promise<string> {
    const payload = JSON.stringify({ e: email.toLowerCase(), x: Date.now() + TTL_MS });
    const p = bytesToB64Url(encoder.encode(payload));
    return `${p}.${await hmac(p)}`;
}

export async function verifyCustomerToken(token: string | undefined): Promise<string | null> {
    if (!token || !getSecret()) return null;
    const [p, sig] = token.split(".");
    if (!p || !sig) return null;
    if ((await hmac(p)) !== sig) return null;
    try {
        const payload = JSON.parse(b64UrlToString(p)) as { e: string; x: number };
        if (typeof payload.x !== "number" || payload.x < Date.now()) return null;
        return payload.e;
    } catch {
        return null;
    }
}
