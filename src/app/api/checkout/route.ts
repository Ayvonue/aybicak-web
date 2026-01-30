import { NextRequest, NextResponse } from "next/server";
import {
    iyzicoConfig,
    generateConversationId,
    formatPriceForIyzico,
    formatPhoneForIyzico,
    CreatePaymentRequest
} from "@/lib/payment";

// This is a placeholder API route for İyzico payment integration
// You need to install the iyzipay package: npm install iyzipay

export async function POST(request: NextRequest) {
    try {
        const body: CreatePaymentRequest = await request.json();
        const { customer, items, totalPrice, callbackUrl } = body;

        // Validate required fields
        if (!customer.firstName || !customer.lastName || !customer.email || !customer.phone) {
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

        const conversationId = generateConversationId();

        // ============================================================
        // İYZİCO ENTEGRASYONU - AŞAĞIDAKİ KODU AKTİF EDİN
        // ============================================================
        // 
        // 1. İyzico paketini yükleyin: npm install iyzipay
        // 2. .env.local dosyasına ekleyin:
        //    IYZICO_API_KEY=your_api_key
        //    IYZICO_SECRET_KEY=your_secret_key
        // 3. Aşağıdaki kodu aktif edin:
        //
        // const Iyzipay = require("iyzipay");
        // 
        // const iyzipay = new Iyzipay({
        //     apiKey: iyzicoConfig.apiKey,
        //     secretKey: iyzicoConfig.secretKey,
        //     uri: iyzicoConfig.baseUrl
        // });
        //
        // const paymentRequest = {
        //     locale: Iyzipay.LOCALE.TR,
        //     conversationId: conversationId,
        //     price: formatPriceForIyzico(totalPrice),
        //     paidPrice: formatPriceForIyzico(totalPrice),
        //     currency: Iyzipay.CURRENCY.TRY,
        //     installment: "1",
        //     basketId: conversationId,
        //     paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
        //     paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        //     callbackUrl: callbackUrl,
        //     buyer: {
        //         id: `BUYER-${Date.now()}`,
        //         name: customer.firstName,
        //         surname: customer.lastName,
        //         email: customer.email,
        //         gsmNumber: formatPhoneForIyzico(customer.phone),
        //         identityNumber: customer.identityNumber || "11111111111",
        //         registrationAddress: customer.address,
        //         city: customer.city,
        //         country: "Turkey",
        //         zipCode: customer.zipCode || "34000"
        //     },
        //     shippingAddress: {
        //         contactName: `${customer.firstName} ${customer.lastName}`,
        //         city: customer.city,
        //         country: "Turkey",
        //         address: customer.address,
        //         zipCode: customer.zipCode || "34000"
        //     },
        //     billingAddress: {
        //         contactName: `${customer.firstName} ${customer.lastName}`,
        //         city: customer.city,
        //         country: "Turkey",
        //         address: customer.address,
        //         zipCode: customer.zipCode || "34000"
        //     },
        //     basketItems: items.map((item, index) => ({
        //         id: item.id,
        //         name: item.name,
        //         category1: item.category || "Bıçak",
        //         itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        //         price: formatPriceForIyzico(item.price * item.quantity)
        //     }))
        // };
        //
        // return new Promise((resolve) => {
        //     iyzipay.checkoutFormInitialize.create(paymentRequest, (err, result) => {
        //         if (err || result.status !== "success") {
        //             resolve(NextResponse.json({
        //                 success: false,
        //                 error: result?.errorMessage || "Ödeme başlatılamadı"
        //             }, { status: 400 }));
        //         } else {
        //             resolve(NextResponse.json({
        //                 success: true,
        //                 paymentPageUrl: result.paymentPageUrl,
        //                 token: result.token
        //             }));
        //         }
        //     });
        // });
        // ============================================================

        // DEMO MODE: Return success with simulated order
        console.log("📦 Order received:", {
            conversationId,
            customer: `${customer.firstName} ${customer.lastName}`,
            email: customer.email,
            items: items.length,
            total: totalPrice,
            paymentMethod: body.paymentMethod || "unknown"
        });

        // Simulate order creation
        return NextResponse.json({
            success: true,
            orderId: conversationId,
            message: "Sipariş alındı!",
            demo: true
        });

    } catch (error) {
        console.error("Payment error:", error);
        return NextResponse.json(
            { success: false, error: "Sunucu hatası" },
            { status: 500 }
        );
    }
}
