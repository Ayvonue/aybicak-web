import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { getSql, isDbConfigured } from "@/lib/db";

// Yeni ürün oluştur
export async function POST(request: Request) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    }
    if (!isDbConfigured()) {
        return NextResponse.json({ error: "Veritabanı yapılandırılmamış." }, { status: 503 });
    }
    try {
        const b = await request.json();
        if (!b.id || !b.name || b.price === undefined) {
            return NextResponse.json({ error: "id, ad ve fiyat zorunludur." }, { status: 400 });
        }
        const price = Number(b.price);
        if (!Number.isFinite(price) || price < 0) {
            return NextResponse.json({ error: "Geçersiz fiyat." }, { status: 400 });
        }

        await getSql()`
            INSERT INTO products (id, name, price, image_url, steel, hardness, handle, category, is_new, description, full_length, barrel_length, thickness)
            VALUES (${b.id}, ${b.name}, ${price}, ${b.imageUrl || null}, ${b.steel || null}, ${b.hardness || null},
                    ${b.handle || null}, ${b.category || null}, ${Boolean(b.isNew)}, ${b.description || null},
                    ${b.fullLength || null}, ${b.barrelLength || null}, ${b.thickness || null})
        `;
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const msg = e instanceof Error && e.message.includes("duplicate") ? "Bu ID zaten kullanımda." : "Ürün eklenemedi.";
        console.error("Admin product create error:", e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
