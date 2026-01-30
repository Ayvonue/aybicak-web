
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../src/data/products.ts');
const fileContent = fs.readFileSync(productsPath, 'utf-8');

const match = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
if (!match) { console.error("No products found"); process.exit(1); }

let products = [];
try { products = eval(match[1]); } catch (e) { process.exit(1); }

const emptyImages = products.filter(p => !p.imageUrl || p.imageUrl.trim() === "");
console.log(`Products with empty imageUrl: ${emptyImages.length}`);
emptyImages.forEach(p => console.log(`- ${p.id}: ${p.name}`));

const suspiciousImages = products.filter(p => p.imageUrl && !p.imageUrl.startsWith("http"));
console.log(`Products with suspicious imageUrl (no http): ${suspiciousImages.length}`);
suspiciousImages.forEach(p => console.log(`- ${p.id}: ${p.imageUrl}`));
