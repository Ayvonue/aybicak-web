import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { updateOrderStatus } from "@/lib/orders";

// Sipariş durumunu güncelle
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    try {
        const { id } = await params;
        const { status } = await request.json();
        const ok = await updateOrderStatus(id, status);
        if (!ok) return NextResponse.json({ error: "Durum güncellenemedi." }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Admin order status error:", e);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
