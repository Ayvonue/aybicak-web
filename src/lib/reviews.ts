import { getSql, isDbConfigured } from "@/lib/db";

export interface Review {
    id: number;
    productId: string;
    name: string;
    rating: number;
    comment: string | null;
    createdAt: string;
}

export interface RatingSummary {
    average: number;
    count: number;
}

interface ReviewRow {
    id: number;
    product_id: string;
    name: string;
    rating: number;
    comment: string | null;
    created_at: string;
}

export async function listReviews(productId: string): Promise<Review[]> {
    if (!isDbConfigured()) return [];
    try {
        const rows = (await getSql()`
            SELECT id, product_id, name, rating, comment, created_at
            FROM reviews WHERE product_id = ${productId} AND approved = true
            ORDER BY created_at DESC LIMIT 50
        `) as ReviewRow[];
        return rows.map((r) => ({
            id: r.id, productId: r.product_id, name: r.name, rating: r.rating,
            comment: r.comment, createdAt: r.created_at,
        }));
    } catch (e) {
        console.error("listReviews hatası:", e);
        return [];
    }
}

export async function getRatingSummary(productId: string): Promise<RatingSummary | null> {
    if (!isDbConfigured()) return null;
    try {
        const rows = (await getSql()`
            SELECT round(avg(rating)::numeric, 1)::float AS average, count(*)::int AS count
            FROM reviews WHERE product_id = ${productId} AND approved = true
        `) as { average: number | null; count: number }[];
        const r = rows[0];
        if (!r || !r.count) return null;
        return { average: r.average || 0, count: r.count };
    } catch {
        return null;
    }
}

export async function createReview(data: {
    productId: string; name: string; rating: number; comment?: string;
}): Promise<boolean> {
    if (!isDbConfigured()) return false;
    const rating = Math.round(Number(data.rating));
    if (!data.productId || !data.name || rating < 1 || rating > 5) return false;
    try {
        await getSql()`
            INSERT INTO reviews (product_id, name, rating, comment)
            VALUES (${data.productId}, ${data.name.slice(0, 80)}, ${rating}, ${data.comment?.slice(0, 2000) || null})
        `;
        return true;
    } catch (e) {
        console.error("createReview hatası:", e);
        return false;
    }
}
