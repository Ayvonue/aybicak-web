
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../src/data/products.ts');
const fileContent = fs.readFileSync(productsPath, 'utf-8');

const match = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
if (!match) process.exit(1);

let products = eval(match[1]);

// 1. Identify Duplicates
const imageUsage = {};
products.forEach(p => {
    const images = p.images || [];
    images.forEach(img => {
        if (!imageUsage[img]) imageUsage[img] = [];
        imageUsage[img].push(p.id);
    });
});

const duplicateImages = Object.keys(imageUsage).filter(img => imageUsage[img].length > 1);
const duplicateSet = new Set(duplicateImages);

console.log(`Identified ${duplicateSet.size} shared images to remove.`);

// 2. Remove Duplicates
let affectedProducts = 0;

products = products.map(p => {
    let images = p.images || [];
    const originalLen = images.length;

    // Filter out shared images
    // Exception: If removing all would leave 0 images, KEEP specific ones? 
    // Or just let it be empty (we have fallback UI now).
    // Let's filter them out. If 0 left, so be it -> better than wrong image.
    images = images.filter(img => !duplicateSet.has(img));

    if (images.length !== originalLen) {
        affectedProducts++;
    }

    // 3. Re-evaluate Main Image
    let imageUrl = p.imageUrl;
    // If main image was one of the removed ones, pick new one
    if (duplicateSet.has(imageUrl) || !images.includes(imageUrl)) {
        if (images.length > 0) {
            imageUrl = images[0];
        } else {
            imageUrl = ""; // Fallback will handle
        }
    }

    return { ...p, imageUrl, images };
});

const newContent = `import { Product } from "@/types";

export const products: Product[] = ${JSON.stringify(products, null, 4)};
`;

fs.writeFileSync(productsPath, newContent, 'utf-8');
console.log(`Removed shared images from ${affectedProducts} products.`);
