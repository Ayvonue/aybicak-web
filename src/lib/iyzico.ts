// İyzico Ödeme Formu (Checkout Form) sunucu tarafı sarmalayıcısı.
// IYZICO_API_KEY ve IYZICO_SECRET_KEY tanımlı değilse kart ödemesi devre dışı
// kalır; sipariş akışı kapıda ödeme ve havale/EFT ile çalışmaya devam eder.

/* eslint-disable @typescript-eslint/no-explicit-any */
import Iyzipay from "iyzipay";
import {
    CustomerInfo,
    OrderItem,
    formatPriceForIyzico,
    formatPhoneForIyzico,
} from "@/lib/payment";

export function isIyzicoConfigured(): boolean {
    return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}

function getClient(): any {
    return new (Iyzipay as any)({
        apiKey: process.env.IYZICO_API_KEY,
        secretKey: process.env.IYZICO_SECRET_KEY,
        // Sandbox anahtarlarıyla test için IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
        uri: process.env.IYZICO_BASE_URL || "https://api.iyzipay.com",
    });
}

export interface CheckoutFormResult {
    success: boolean;
    paymentPageUrl?: string;
    token?: string;
    errorMessage?: string;
}

export function initializeCheckoutForm(params: {
    conversationId: string;
    customer: CustomerInfo;
    items: OrderItem[];
    totalPrice: number;
    callbackUrl: string;
}): Promise<CheckoutFormResult> {
    const { conversationId, customer, items, totalPrice, callbackUrl } = params;
    const iyzipay = getClient();

    // İyzico, sepet kalemleri toplamının price alanıyla birebir eşleşmesini ister
    const basketItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        category1: item.category || "Bıçak",
        itemType: (Iyzipay as any).BASKET_ITEM_TYPE.PHYSICAL,
        price: formatPriceForIyzico(item.price * item.quantity),
    }));
    const basketTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const address = {
        contactName: `${customer.firstName} ${customer.lastName}`,
        city: customer.city,
        country: "Turkey",
        address: customer.address,
        zipCode: customer.zipCode || "34000",
    };

    const request = {
        locale: (Iyzipay as any).LOCALE.TR,
        conversationId,
        price: formatPriceForIyzico(basketTotal),
        paidPrice: formatPriceForIyzico(totalPrice),
        currency: (Iyzipay as any).CURRENCY.TRY,
        basketId: conversationId,
        paymentGroup: (Iyzipay as any).PAYMENT_GROUP.PRODUCT,
        callbackUrl,
        buyer: {
            id: `BUYER-${Date.now()}`,
            name: customer.firstName,
            surname: customer.lastName,
            email: customer.email,
            gsmNumber: formatPhoneForIyzico(customer.phone),
            identityNumber: customer.identityNumber || "11111111111",
            registrationAddress: customer.address,
            city: customer.city,
            country: "Turkey",
            zipCode: customer.zipCode || "34000",
        },
        shippingAddress: address,
        billingAddress: address,
        basketItems,
    };

    return new Promise((resolve) => {
        iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
            if (err || result?.status !== "success") {
                resolve({
                    success: false,
                    errorMessage: result?.errorMessage || err?.message || "Ödeme başlatılamadı",
                });
            } else {
                resolve({
                    success: true,
                    paymentPageUrl: result.paymentPageUrl,
                    token: result.token,
                });
            }
        });
    });
}

export interface PaymentVerifyResult {
    success: boolean;
    paymentStatus?: string;
    conversationId?: string;
    paidPrice?: string;
    errorMessage?: string;
}

export function retrieveCheckoutForm(token: string): Promise<PaymentVerifyResult> {
    const iyzipay = getClient();

    return new Promise((resolve) => {
        iyzipay.checkoutForm.retrieve(
            { locale: (Iyzipay as any).LOCALE.TR, token },
            (err: any, result: any) => {
                if (err || result?.status !== "success" || result?.paymentStatus !== "SUCCESS") {
                    resolve({
                        success: false,
                        paymentStatus: result?.paymentStatus,
                        errorMessage: result?.errorMessage || err?.message || "Ödeme doğrulanamadı",
                    });
                } else {
                    resolve({
                        success: true,
                        paymentStatus: result.paymentStatus,
                        conversationId: result.conversationId,
                        paidPrice: result.paidPrice,
                    });
                }
            }
        );
    });
}
