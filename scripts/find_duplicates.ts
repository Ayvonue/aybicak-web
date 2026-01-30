
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../src/data/products.ts');
const fileContent = fs.readFileSync(productsPath, 'utf-8');

const match = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
if (!match) process.exit(1);

let products = eval(match[1]);

// Map image -> [productIds]
const imageUsage = {};

products.forEach(p => {
    const images = p.images || [];
    images.forEach(img => {
        if (!imageUsage[img]) imageUsage[img] = [];
        imageUsage[img].push(p.id);
    });
});

// Find images used by > 1 product
const duplicates = Object.entries(imageUsage).filter(([img, ids]) => ids.length > 1);

console.log(`Found ${duplicates.length} images used in multiple products.`);

// For each duplicate, show sample usage
duplicates.slice(0, 10).forEach(([img, ids]) => {
    console.log(`Image: ${img.split('/').pop()}`);
    console.log(`  Used in ${ids.length} products: ${ids.slice(0, 5).join(', ')}...`);
});

// Let's print the specific images for product "Kamp Sef Bicagi" (we can search by name if we knew the ID, but let's assume we'll fix globally)
