import { getSql, isDbConfigured } from "@/lib/db";

export interface CouponResult {
    valid: boolean;
    code?: string;
    discount?: number;   // hesaplanan indirim tutarı (₺)
    error?: string;
}

interface CouponRow {
    code: string;
    type: "percent" | "fixed";
    value: string | number;
    min_total: string | number;
    active: boolean;
    expires_at: string | null;
}

// Kupon kodunu ara toplam üzerinden doğrular ve indirim tutarını döner.
export async function validateCoupon(code: string, subtotal: number): Promise<CouponResult> {
    if (!isDbConfigured()) return { valid: false, error: "Kupon servisi kullanılamıyor." };
    if (!code) return { valid: false, error: "Kupon kodu girin." };

    const rows = (await getSql()`
        SELECT code, type, value, min_total, active, expires_at
        FROM coupons WHERE upper(code) = ${code.trim().toUpperCase()} LIMIT 1
    `) as CouponRow[];

    const c = rows?.[0];
    if (!c || !c.active) return { valid: false, error: "Geçersiz kupon kodu." };
    if (c.expires_at && new Date(c.expires_at).getTime() < Date.now()) {
        return { valid: false, error: "Kuponun süresi dolmuş." };
    }
    const minTotal = Number(c.min_total) || 0;
    if (subtotal < minTotal) {
        return { valid: false, error: `Bu kupon en az ${minTotal.toLocaleString("tr-TR")}₺ alışverişte geçerli.` };
    }

    const value = Number(c.value);
    let discount = c.type === "percent" ? (subtotal * value) / 100 : value;
    discount = Math.min(discount, subtotal); // toplamdan fazla indirim olmaz
    discount = Math.round(discount * 100) / 100;

    return { valid: true, code: c.code, discount };
}
