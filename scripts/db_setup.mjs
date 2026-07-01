// Veritabanı tablolarını oluşturur ve products.ts'teki ürünleri seed'ler.
// Kullanım: node --env-file=.env.local scripts/db_setup.mjs
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import path from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
    console.error("DATABASE_URL yok. node --env-file=.env.local scripts/db_setup.mjs ile çalıştırın.");
    process.exit(1);
}
const sql = neon(url);

// products.ts'i güvenli şekilde ayrıştır (TS import etmeden, JSON blokları oku)
function loadProducts() {
    const file = readFileSync(path.resolve(import.meta.dirname, "../src/data/products.ts"), "utf8");
    const start = file.indexOf("[");
    const end = file.lastIndexOf("]");
    const arrText = file.slice(start, end + 1);
    // TS -> JSON: sondaki virgülleri temizle, güvenli parse
    // Dosya zaten JSON benzeri; eval yerine Function ile izole değerlendirme
    return Function(`"use strict"; return (${arrText});`)();
}

async function main() {
    console.log("Tablolar oluşturuluyor...");
    await sql`
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price NUMERIC NOT NULL,
            image_url TEXT,
            steel TEXT,
            hardness TEXT,
            handle TEXT,
            category TEXT,
            is_new BOOLEAN DEFAULT false,
            description TEXT,
            full_length TEXT,
            barrel_length TEXT,
            thickness TEXT,
            active BOOLEAN DEFAULT true,
            sort_order SERIAL,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        )
    `;
    await sql`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            customer_name TEXT,
            customer_email TEXT,
            customer_phone TEXT,
            address TEXT,
            city TEXT,
            items JSONB NOT NULL,
            total NUMERIC NOT NULL,
            payment_method TEXT,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT now()
        )
    `;
    await sql`CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC)`;

    const products = loadProducts();
    console.log(`${products.length} ürün seed'leniyor (upsert)...`);

    let count = 0;
    for (const p of products) {
        await sql`
            INSERT INTO products (id, name, price, image_url, steel, hardness, handle, category, is_new, description, full_length, barrel_length, thickness)
            VALUES (${p.id}, ${p.name}, ${p.price}, ${p.imageUrl || null}, ${p.steel || null}, ${p.hardness || null}, ${p.handle || null}, ${p.category || null}, ${Boolean(p.isNew)}, ${p.description || null}, ${p.fullLength || null}, ${p.barrelLength || null}, ${p.thickness || null})
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name, price = EXCLUDED.price, image_url = EXCLUDED.image_url,
                steel = EXCLUDED.steel, hardness = EXCLUDED.hardness, handle = EXCLUDED.handle,
                category = EXCLUDED.category, is_new = EXCLUDED.is_new, description = EXCLUDED.description,
                full_length = EXCLUDED.full_length, barrel_length = EXCLUDED.barrel_length,
                thickness = EXCLUDED.thickness, updated_at = now()
        `;
        count++;
        if (count % 50 === 0) console.log(`  ${count}/${products.length}`);
    }

    const [{ c }] = await sql`SELECT count(*)::int AS c FROM products`;
    console.log(`Tamamlandı. Veritabanında ${c} ürün var.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
