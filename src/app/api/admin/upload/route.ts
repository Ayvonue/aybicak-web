import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/adminGuard";

// Ürün görseli yükleme — Vercel Blob'a kaydeder, herkese açık URL döner.
// BLOB_READ_WRITE_TOKEN gerekir (Vercel'de Blob store bağlanınca otomatik gelir).
export async function POST(request: Request) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
            { error: "Görsel deposu yapılandırılmamış. Vercel'de Blob store bağlayın (BLOB_READ_WRITE_TOKEN)." },
            { status: 503 }
        );
    }
    try {
        const form = await request.formData();
        const file = form.get("file") as File | null;
        if (!file) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "Yalnızca görsel yüklenebilir." }, { status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "Görsel en fazla 5MB olabilir." }, { status: 400 });
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const blob = await put(`products/${Date.now()}-${safeName}`, file, {
            access: "public",
            addRandomSuffix: true,
        });
        return NextResponse.json({ success: true, url: blob.url });
    } catch (e) {
        console.error("Upload error:", e);
        return NextResponse.json({ error: "Yükleme başarısız." }, { status: 500 });
    }
}
