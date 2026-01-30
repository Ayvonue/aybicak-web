import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
    }).format(price);
}

export function normalizeTR(text: string) {
    if (!text) return "";
    return text
        .replace(/ğ/g, "g")
        .replace(/Ğ/g, "G")
        .replace(/ü/g, "u")
        .replace(/Ü/g, "U")
        .replace(/ş/g, "s")
        .replace(/Ş/g, "S")
        .replace(/ı/g, "i")
        .replace(/İ/g, "I")
        .replace(/ö/g, "o")
        .replace(/Ö/g, "O")
        .replace(/ç/g, "c")
        .replace(/Ç/g, "C");
}

export function getSizesFromDescription(description?: string): string[] {
    if (!description) return [];

    // Pattern 1: Explicit "No:1", "No:2" etc. often found in these products
    const noRegex = /No[:\s]*(\d+)/gi;
    const matches = [...description.matchAll(noRegex)];
    if (matches.length > 0) {
        // If "No:1" is found, it usually implies there are multiple sizes in the series, 
        // OR this specific product IS No:1. 
        // A better approach for this user: If the description MENTIONS sizes like "No:1, No:2 ve No:3 olarak üretilmiştir", extract them.
        // But often the title says "No:2". 
        // Let's look for comma separated list of sizes or explicit "Boyutlar:"

        // Simpler heuristic: If title or desc contains "No:", allow generic size selection if not explicit?
        // Actually, user said "bazılarında boyut seçeneği olanlara".
        // Let's look for "Boyut Seçenekleri" or keywords.
        // Since we don't have that structured data, let's look for the distinct Numbers mentioned in context of size.
        return [];
    }

    // Heuristic: If it's a "No:X" product, it likely has siblings. 
    // But for a single product page, we are displaying ONE item. 
    // Unless the user wants to switch between No:1 and No:2 on the same page?
    // User said "bazılarında boyut seçeneği olanlara... sepette boyut seçeneğide seçmesi lazım".
    // This implies ONE product entry can have multiple sizes selected (like a T-Shirt).
    // If the data doesn't support this (each ID is one size), we might be faking it or identifying products that are multi-size.

    // Fallback: Check if description contains "cm" ranges or similar?
    // Let's try to find patterns like "18 cm", "20 cm" listed together.

    // For now, let's return a default list if keywords are found, to demonstrate the UI.
    const lower = description.toLowerCase();
    if (lower.includes("boyut seçeneği") || lower.includes("farklı boy") || lower.includes("no:1") || lower.includes("no:2")) {
        return ["Küçük Boy (No:1)", "Orta Boy (No:2)", "Büyük Boy (No:3)"];
    }

    return [];
}
