import { NextRequest, NextResponse } from "next/server";
import { retrieveCheckoutForm, isIyzicoConfigured } from "@/lib/iyzico";

// İyzico, ödeme tamamlandığında bu adrese token ile POST yapar.
// Token sunucu tarafında doğrulanır ve müşteri sonuç sayfasına yönlendirilir.
export async function POST(request: NextRequest) {
    const origin = request.nextUrl.origin;

    try {
        if (!isIyzicoConfigured()) {
            return NextResponse.redirect(`${origin}/checkout/result?status=error`, 303);
        }

        const formData = await request.formData();
        const token = formData.get("token")?.toString();

        if (!token) {
            return NextResponse.redirect(`${origin}/checkout/result?status=error`, 303);
        }

        const result = await retrieveCheckoutForm(token);

        if (result.success) {
            const orderId = encodeURIComponent(result.conversationId || "");
            return NextResponse.redirect(
                `${origin}/checkout/result?status=success&orderId=${orderId}`,
                303
            );
        }

        return NextResponse.redirect(`${origin}/checkout/result?status=failed`, 303);
    } catch (error) {
        console.error("Payment callback error:", error);
        return NextResponse.redirect(`${origin}/checkout/result?status=error`, 303);
    }
}
