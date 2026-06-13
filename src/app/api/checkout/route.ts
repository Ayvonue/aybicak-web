import { NextRequest, NextResponse } from "next/server";
import { generateConversationId, CreatePaymentRequest } from "@/lib/payment";
import { initializeCheckoutForm, isIyzicoConfigured } from "@/lib/iyzico";
import { sendOrderEmails } from "@/lib/email";
import { rateLimit } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        if (!rateLimit(`checkout:${ip}`, 10, 10 * 60 * 1000)) {
            return NextResponse.json(
                { success: false, error: "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin." },
                { status: 429 }
            );
        }

        const body: CreatePaymentRequest & { notes?: string } = await request.json();
        const { customer, items, totalPrice, callbackUrl, paymentMethod, notes } = body;

        // Validate required fields
        if (!customer?.firstName || !customer?.lastName || !customer?.email || !customer?.phone) {
            return NextResponse.json(
                { success: false, error: "Eksik müşteri bilgileri" },
                { status: 400 }
            );
        }

        if (!items || items.length === 0) {
            return NextResponse.json(
                { success: false, error: "Sepet boş" },
                { status: 400 }
            );
        }

        if (typeof totalPrice !== "number" || totalPrice <= 0) {
            return NextResponse.json(
                { success: false, error: "Geçersiz sipariş tutarı" },
                { status: 400 }
            );
        }

        const conversationId = generateConversationId();

        // Kredi kartı: İyzico Ödeme Formu başlatılır, müşteri ödeme sayfasına yönlendirilir
        if (paymentMethod === "card") {
            if (!isIyzicoConfigured()) {
                return NextResponse.json(
                    { success: false, error: "Kart ile ödeme şu an aktif değil. Lütfen başka bir ödeme yöntemi seçin." },
                    { status: 503 }
                );
            }

            const result = await initializeCheckoutForm({
                conversationId,
                customer,
                items,
                totalPrice,
                callbackUrl,
            });

            if (!result.success) {
                return NextResponse.json(
                    { success: false, error: result.errorMessage },
                    { status: 400 }
                );
            }

            return NextResponse.json({
                success: true,
                orderId: conversationId,
                paymentPageUrl: result.paymentPageUrl,
                token: result.token,
            });
        }

        // Kapıda ödeme / Havale: sipariş onay e-postaları gönderilir.
        // E-posta gönderimi başarısız olsa bile sipariş reddedilmez (loglanır).
        await sendOrderEmails({
            orderId: conversationId,
            customerName: `${customer.firstName} ${customer.lastName}`,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            address: customer.address,
            city: customer.city,
            items: items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
            totalPrice,
            paymentMethod: paymentMethod || "cod",
            notes,
        });

        console.log("📦 Order received:", {
            conversationId,
            customer: `${customer.firstName} ${customer.lastName}`,
            email: customer.email,
            items: items.length,
            total: totalPrice,
            paymentMethod: paymentMethod || "unknown",
        });

        return NextResponse.json({
            success: true,
            orderId: conversationId,
            message: "Sipariş alındı!",
        });

    } catch (error) {
        console.error("Payment error:", error);
        return NextResponse.json(
            { success: false, error: "Sunucu hatası" },
            { status: 500 }
        );
    }
}
