// İyzico Payment Integration Types & Service
// Replace API_KEY and SECRET_KEY with your İyzico credentials

export interface IyzicoConfig {
    apiKey: string;
    secretKey: string;
    baseUrl: string; // "https://sandbox-api.iyzipay.com" for test, "https://api.iyzipay.com" for production
}

export interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    identityNumber?: string; // TC Kimlik (optional for some transactions)
}

export interface OrderItem {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
}

export interface CreatePaymentRequest {
    customer: CustomerInfo;
    items: OrderItem[];
    totalPrice: number;
    callbackUrl: string;
    paymentMethod?: "cod" | "transfer";
}

export interface PaymentResult {
    success: boolean;
    paymentId?: string;
    htmlContent?: string; // 3D Secure form HTML
    errorMessage?: string;
    errorCode?: string;
}

// Configuration - Set your credentials here or use environment variables
export const iyzicoConfig: IyzicoConfig = {
    apiKey: process.env.IYZICO_API_KEY || "sandbox-api-key",
    secretKey: process.env.IYZICO_SECRET_KEY || "sandbox-secret-key",
    baseUrl: process.env.NODE_ENV === "production"
        ? "https://api.iyzipay.com"
        : "https://sandbox-api.iyzipay.com"
};

// Generate random conversation ID for İyzico
export function generateConversationId(): string {
    return `AYB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format price for İyzico (requires string with 2 decimals)
export function formatPriceForIyzico(price: number): string {
    return price.toFixed(2);
}

// Validate Turkish phone number
export function validateTurkishPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, "");
    return /^(5\d{9}|0?5\d{9}|90?5\d{9})$/.test(cleaned);
}

// Format phone for İyzico (+905xxxxxxxxx)
export function formatPhoneForIyzico(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("90")) return `+${cleaned}`;
    if (cleaned.startsWith("0")) return `+9${cleaned}`;
    if (cleaned.startsWith("5")) return `+90${cleaned}`;
    return `+90${cleaned}`;
}
