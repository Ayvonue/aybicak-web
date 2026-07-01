// Yeni özellikler için ek tablolar (users, reviews, coupons). İdempotent.
// Kullanım: node --env-file=.env.local scripts/db_migrate.mjs
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
if (!url) { console.error("DATABASE_URL/POSTGRES_URL yok."); process.exit(1); }
const sql = neon(url);

async function main() {
    // Kalıcı müşteri hesapları
    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password_hash TEXT NOT NULL,
            birth_date TEXT,
            gender TEXT,
            created_at TIMESTAMPTZ DEFAULT now()
        )
    `;
    // Ürün yorumları
    await sql`
        CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            product_id TEXT NOT NULL,
            name TEXT NOT NULL,
            rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment TEXT,
            approved BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT now()
        )
    `;
    await sql`CREATE INDEX IF NOT EXISTS reviews_product_idx ON reviews (product_id)`;
    // İndirim kuponları
    await sql`
        CREATE TABLE IF NOT EXISTS coupons (
            code TEXT PRIMARY KEY,
            type TEXT NOT NULL CHECK (type IN ('percent','fixed')),
            value NUMERIC NOT NULL,
            min_total NUMERIC DEFAULT 0,
            active BOOLEAN DEFAULT true,
            expires_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT now()
        )
    `;
    // Örnek kupon (yoksa) — hoş geldin %10
    await sql`
        INSERT INTO coupons (code, type, value, min_total, active)
        VALUES ('HOSGELDIN10', 'percent', 10, 500, true)
        ON CONFLICT (code) DO NOTHING
    `;

    const [{ u }] = await sql`SELECT count(*)::int u FROM users`;
    const [{ r }] = await sql`SELECT count(*)::int r FROM reviews`;
    const [{ c }] = await sql`SELECT count(*)::int c FROM coupons`;
    console.log(`Tamamlandı. users=${u}, reviews=${r}, coupons=${c}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
