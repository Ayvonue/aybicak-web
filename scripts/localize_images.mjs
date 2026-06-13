// Ürün görsellerini bicakmarket.com'dan indirip WebP olarak public/products/
// altına kaydeder ve products.ts içindeki imageUrl alanlarını günceller.
// Kullanım: node scripts/localize_images.mjs

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const PRODUCTS_FILE = path.join(ROOT, "src/data/products.ts");
const OUT_DIR = path.join(ROOT, "public/products");
const CONCURRENCY = 8;

async function downloadWithRetry(url, attempts = 3) {
    for (let i = 0; i < attempts; i++) {
        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return Buffer.from(await res.arrayBuffer());
        } catch (e) {
            if (i === attempts - 1) throw e;
            await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
        }
    }
}

async function main() {
    await fs.mkdir(OUT_DIR, { recursive: true });
    let source = await fs.readFile(PRODUCTS_FILE, "utf8");

    // id → imageUrl eşlemelerini sırayla çıkar
    const entries = [];
    const blockRegex = /"id":\s*"([^"]+)"[\s\S]*?"imageUrl":\s*"(https:\/\/www\.bicakmarket\.com[^"]+)"/g;
    let match;
    while ((match = blockRegex.exec(source)) !== null) {
        entries.push({ id: match[1], url: match[2] });
    }
    console.log(`${entries.length} ürün görseli bulundu.`);

    const failed = [];
    let done = 0;

    async function processEntry({ id, url }) {
        const outFile = path.join(OUT_DIR, `${id}.webp`);
        try {
            // Daha önce indirilmişse atla (yeniden çalıştırılabilir)
            await fs.access(outFile);
        } catch {
            try {
                const buffer = await downloadWithRetry(url);
                await sharp(buffer)
                    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
                    .webp({ quality: 82 })
                    .toFile(outFile);
            } catch (e) {
                failed.push({ id, url, error: e.message });
                return;
            }
        }
        done++;
        if (done % 25 === 0) console.log(`${done}/${entries.length} tamamlandı...`);
    }

    // Sınırlı eşzamanlılıkla indir
    const queue = [...entries];
    await Promise.all(
        Array.from({ length: CONCURRENCY }, async () => {
            while (queue.length > 0) {
                await processEntry(queue.shift());
            }
        })
    );

    console.log(`İndirme bitti: ${done} başarılı, ${failed.length} hatalı.`);
    if (failed.length > 0) {
        console.log("Hatalılar:", JSON.stringify(failed, null, 2));
    }

    // Sadece başarıyla indirilen görsellerin URL'lerini değiştir
    const failedIds = new Set(failed.map((f) => f.id));
    for (const { id, url } of entries) {
        if (failedIds.has(id)) continue;
        source = source.replace(`"imageUrl": "${url}"`, `"imageUrl": "/products/${id}.webp"`);
    }
    await fs.writeFile(PRODUCTS_FILE, source);
    console.log("products.ts güncellendi.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
