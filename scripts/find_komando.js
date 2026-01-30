
const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../src/data/products.ts');
const fileContent = fs.readFileSync(PRODUCTS_PATH, 'utf-8');
const match = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
const products = eval(match[1]);

function checkKomando(product) {
    const pName = (product.name || "").toLowerCase();
    const pDesc = (product.description || "").toLowerCase();
    return pName.includes("komando") || pName.includes("taktik") || pName.includes("asker") || pDesc.includes("kamuflaj") || pDesc.includes("kılıf");
}

const komandoProducts = products.filter(checkKomando);
console.log("Found Komando Products:", komandoProducts.length);
komandoProducts.forEach(p => {
    console.log(`ID: ${p.id}, Name: ${p.name}, Img: ${p.imageUrl}`);
});
