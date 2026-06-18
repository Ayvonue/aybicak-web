// Son görüntülenen ürünleri localStorage'da tutar (DB gerektirmeden
// kişiselleştirme). Yalnızca ürün id'leri saklanır.

const KEY = "aybicak-recently-viewed";
const MAX = 12;

export function getRecentlyViewed(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
        return [];
    }
}

export function addRecentlyViewed(id: string): void {
    if (typeof window === "undefined") return;
    try {
        const current = getRecentlyViewed().filter((x) => x !== id);
        const next = [id, ...current].slice(0, MAX);
        localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        // sessizce yoksay
    }
}
