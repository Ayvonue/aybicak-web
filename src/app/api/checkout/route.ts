import { NextRequest, NextResponse } from "next/server";
import { generateConversationId, CreatePaymentRequest } from "@/lib/payment";
import { initializeCheckoutForm, isIyzicoConfigured } from "@/lib/iyzico";
import { sendOrderEmails } from "@/lib/email";
import { rateLimit } from "@/lib/auth";
import { products } from "@/data/products";

// İstemciden gelen fiyatlara ASLA güvenilmez; her ürün ve toplam tutar
// sunucu tarafında products.ts (tek doğru kaynak) ile yeniden hesaplanır.
// Bu, "price: 1 gönderip ürünü 1₺'ye alma" saldırısını engeller.
const MAX_MEMBER_DISCOUNT = 0.05; // Üye indirimi tavanı

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

        // Her kalemi gerçek ürün verisiyle doğrula ve fiyatı sunucudan al
        const validatedItems: { id: string; name: string; category: string; price: number; quantity: number }[] = [];
        for (const item of items) {
            const product = products.find((p) => p.id === item.id);
            if (!product) {
                return NextResponse.json(
                    { success: false, error: `Ürün bulunamadı: ${item.id}` },
                    { status: 400 }
                );
            }
            const quantity = Math.floor(Number(item.quantity));
            if (!Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
                return NextResponse.json(
                    { success: false, error: "Geçersiz ürün adedi" },
                    { status: 400 }
                );
            }
            validatedItems.push({
                id: product.id,
                name: product.name,
                category: product.category || "Bıçak",
                price: product.price, // İstemci fiyatı yok sayılır
                quantity,
            });
        }

        // Toplam tutar sunucuda hesaplanır; istemci değeri yalnızca üye
        // indirimi (en fazla %5) sınırları içinde kabul edilir.
        const subtotal = validatedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
        const minAcceptable = subtotal * (1 - MAX_MEMBER_DISCOUNT);
        const clientTotal = Number(totalPrice);
        const finalTotal =
            Number.isFinite(clientTotal) && clientTotal >= minAcceptable && clientTotal <= subtotal
                ? clientTotal
                : subtotal;

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
                items: validatedItems,
                totalPrice: finalTotal,
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
            items: validatedItems.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
            totalPrice: finalTotal,
            paymentMethod: paymentMethod || "cod",
            notes,
        });

        console.log("📦 Order received:", {
            conversationId,
            customer: `${customer.firstName} ${customer.lastName}`,
            email: customer.email,
            items: validatedItems.length,
            total: finalTotal,
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
