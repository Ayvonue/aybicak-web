const fs = require('fs');
const https = require('https');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../src/data/products.ts');

// Helper to fetch URL content
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchUrl(res.headers.location).then(resolve).catch(reject);
            }

            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        });

        req.on('error', reject);
    });
}

async function fixData() {
    console.log('Reading products.ts...');
    let content = fs.readFileSync(PRODUCTS_PATH, 'utf-8');

    // Extract the JSON array part
    const match = content.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
    if (!match) {
        console.error('Could not find products array in file.');
        return;
    }

    const products = eval(match[1]);
    let updatedCount = 0;

    console.log(`Found ${products.length} products. Scanning for issues...`);

    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const needsFix = p.imageUrl.includes('b-lazy-load') || p.name.includes(''); // Check for lazy load or bad encoding

        if (needsFix) {
            console.log(`[${i + 1}/${products.length}] Fixing product ${p.id}: ${p.name}`);

            try {
                // Construct URL with dummy slug, relying on ID
                // Note: Real site redirects or serves content if ID is valid
                const url = `https://www.bicakmarket.com/urun/temp/${p.id}`;
                const html = await fetchUrl(url);

                // Extract OpenGraph Image
                const imgMatch = html.match(/<meta property="og:image" content="(.*?)"/);
                // Extract OpenGraph Title (Clean Name)
                const titleMatch = html.match(/<meta property="og:title" content="(.*?)"/);

                if (imgMatch && imgMatch[1]) {
                    p.imageUrl = imgMatch[1];
                    // Ensure https
                    if (p.imageUrl.startsWith('http:')) p.imageUrl = p.imageUrl.replace('http:', 'https:');
                } else {
                    console.warn(`  No image found for ${p.id}`);
                }

                if (titleMatch && titleMatch[1]) {
                    // Title format is usually "Name - Bıçak Market" or similar
                    let cleanName = titleMatch[1];
                    cleanName = cleanName.replace(' - Bıçak Market', '').replace(' - BicakMarket', '');

                    // Decode HTML entities if any (basic ones)
                    cleanName = cleanName.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

                    p.name = cleanName.trim();
                }

                updatedCount++;

                // Small delay to be nice to the server
                await new Promise(r => setTimeout(r, 300));

            } catch (err) {
                console.error(`  Failed to fetch ${p.id}:`, err.message);
            }
        }
    }

    console.log(`Updated ${updatedCount} products.`);

    // Write back
    const newContent = `// Verified data via robust JS import
import { Product } from "@/types";

export const products: Product[] = ${JSON.stringify(products, null, 4)};
`;

    fs.writeFileSync(PRODUCTS_PATH, newContent, 'utf-8'); // Ensure utf-8 write
    console.log('Saved to products.ts');
}

fixData();
