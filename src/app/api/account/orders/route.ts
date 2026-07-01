import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCustomerToken, CUSTOMER_COOKIE } from "@/lib/customerSession";
import { listOrdersByEmail } from "@/lib/orders";

// Giriş yapmış müşterinin kendi siparişleri (oturum çerezinden e-posta ile)
export async function GET() {
    const store = await cookies();
    const email = await verifyCustomerToken(store.get(CUSTOMER_COOKIE)?.value);
    if (!email) {
        return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }
    const orders = await listOrdersByEmail(email);
    return NextResponse.json({ orders });
}
