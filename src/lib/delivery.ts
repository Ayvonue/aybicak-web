// Tahmini teslimat tarihi hesaplama — ürün ve sepet sayfalarında
// "Bugün sipariş ver, X tarihinde kapında" güven sinyali için.

const TR_DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const TR_MONTHS = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

// Belirtilen iş günü kadar ileri git (Pazar'ı atla)
function addBusinessDays(start: Date, days: number): Date {
    const date = new Date(start);
    let added = 0;
    while (added < days) {
        date.setDate(date.getDate() + 1);
        if (date.getDay() !== 0) added++; // Pazar tatil
    }
    return date;
}

export interface DeliveryEstimate {
    label: string;       // "16 - 18 Haziran"
    cutoffPassed: boolean;
}

// Kargo kesim saati 15:00; öncesinde sipariş bugün, sonrasında yarın hazırlanır.
export function getDeliveryEstimate(now: Date = new Date()): DeliveryEstimate {
    const cutoffPassed = now.getHours() >= 15;
    const base = cutoffPassed ? addBusinessDays(now, 1) : now;

    const earliest = addBusinessDays(base, 2);
    const latest = addBusinessDays(base, 4);

    const sameMonth = earliest.getMonth() === latest.getMonth();
    const label = sameMonth
        ? `${earliest.getDate()} - ${latest.getDate()} ${TR_MONTHS[latest.getMonth()]}`
        : `${earliest.getDate()} ${TR_MONTHS[earliest.getMonth()]} - ${latest.getDate()} ${TR_MONTHS[latest.getMonth()]}`;

    return { label, cutoffPassed };
}

export function formatTRDate(date: Date): string {
    return `${date.getDate()} ${TR_MONTHS[date.getMonth()]} ${TR_DAYS[date.getDay()]}`;
}
