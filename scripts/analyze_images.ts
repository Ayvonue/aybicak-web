
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../src/data/products.ts');
const fileContent = fs.readFileSync(productsPath, 'utf-8');

const match = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
if (!match) process.exit(1);

let products = [];
try { products = eval(match[1]); } catch (e) { process.exit(1); }

const imageCounts = {};

products.forEach(p => {
    const images = p.images || [];
    images.forEach(img => {
        const filename = img.split('/').pop();
        imageCounts[filename] = (imageCounts[filename] || 0) + 1;
    });
});

// Sort by frequency
const sorted = Object.entries(imageCounts).sort((a, b) => b[1] - a[1]);

console.log("Most frequent images:");
sorted.slice(0, 20).forEach(([name, count]) => {
    console.log(`${name}: ${count} uses`);
});
