
const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../src/data/products.ts');
const fileContent = fs.readFileSync(PRODUCTS_PATH, 'utf-8');
const match = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
const products = eval(match[1]);

const kampProducts = products.filter(p => p.category === 'Kamp Bıçağı');
const avProducts = products.filter(p => p.category === 'Av Bıçağı');

console.log(`--- Kamp Bıçağı (${kampProducts.length}) ---`);
kampProducts.slice(0, 30).forEach(p => console.log(p.name));

console.log(`\n--- Av Bıçağı (${avProducts.length}) ---`);
avProducts.slice(0, 30).forEach(p => console.log(p.name));

console.log("\n--- Checking for 'Komando' in names ---");
const komando = products.filter(p => p.name.toLowerCase().includes('komando') || p.name.toLowerCase().includes('taktik'));
komando.forEach(p => console.log(`[${p.category}] ${p.name}`));
