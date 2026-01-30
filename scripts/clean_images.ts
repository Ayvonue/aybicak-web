
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../src/data/products.ts');
const fileContent = fs.readFileSync(productsPath, 'utf-8');

const match = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
if (!match) process.exit(1);

let products = eval(match[1]);

// Cleaning logic
let cleanedCount = 0;
products = products.map(p => {
    let changed = false;
    let imageUrl = p.imageUrl;

    // Check key patterns found in audit
    if (imageUrl && !imageUrl.startsWith('http')) {
        // e.g. "Bıçak Market", "Yatağan"
        imageUrl = "";
        changed = true;
    }

    if (changed) {
        cleanedCount++;
        return { ...p, imageUrl };
    }
    return p;
});

const newContent = `import { Product } from "@/types";

export const products: Product[] = ${JSON.stringify(products, null, 4)};
`;

fs.writeFileSync(productsPath, newContent, 'utf-8');
console.log(`Cleaned image URLs for ${cleanedCount} products.`);
