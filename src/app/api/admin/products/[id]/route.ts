import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { getSql, isDbConfigured } from "@/lib/db";

// Ürün güncelle
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    if (!isDbConfigured()) return NextResponse.json({ error: "Veritabanı yapılandırılmamış." }, { status: 503 });

    try {
        const { id } = await params;
        const b = await request.json();
        const price = Number(b.price);
        if (!b.name || !Number.isFinite(price) || price < 0) {
            return NextResponse.json({ error: "Geçerli ad ve fiyat zorunludur." }, { status: 400 });
        }

        const rows = await getSql()`
            UPDATE products SET
                name = ${b.name}, price = ${price}, image_url = ${b.imageUrl || null},
                steel = ${b.steel || null}, hardness = ${b.hardness || null}, handle = ${b.handle || null},
                category = ${b.category || null}, is_new = ${Boolean(b.isNew)}, description = ${b.description || null},
                full_length = ${b.fullLength || null}, barrel_length = ${b.barrelLength || null},
                thickness = ${b.thickness || null}, active = ${b.active === false ? false : true}, updated_at = now()
            WHERE id = ${id} RETURNING id
        `;
        if (!rows || (rows as unknown[]).length === 0) {
            return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Admin product update error:", e);
        return NextResponse.json({ error: "Ürün güncellenemedi." }, { status: 500 });
    }
}

// Ürün sil
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    if (!isDbConfigured()) return NextResponse.json({ error: "Veritabanı yapılandırılmamış." }, { status: 503 });

    try {
        const { id } = await params;
        await getSql()`DELETE FROM products WHERE id = ${id}`;
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Admin product delete error:", e);
        return NextResponse.json({ error: "Ürün silinemedi." }, { status: 500 });
    }
}
