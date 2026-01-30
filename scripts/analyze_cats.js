
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../src/data/products.ts');
const fileContent = fs.readFileSync(productsPath, 'utf-8');
const match = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
const products = eval(match[1]);

const STATIC_CATEGORIES = [
    "AV BIÇAĞI ÇEŞİTLERİ",
    "KOMANDO BIÇAKLARI",
    "BALTA ÇEŞİTLERİ",
    "ÇAKI ÇEŞİTLERİ",
    "KILIÇ ÇEŞİTLERİ",
    "BIÇAK SETLERİ",
    "Altın İşlemeli Bıçaklar",
    "SATIR",
    "Ekmek Bıçakları",
    "Şef Bıçakları",
    "Kurban Bıçakları",
    "Döner Bıçağı",
    "Sebze & Meyve Bıçakları",
    "MASAT",
    "MİNYATÜRLER",
    "SALLAMA",
    "ZIRH ÇEŞİTLERİ"
];

// Get unique categories from products
const dbCategories = [...new Set(products.map(p => p.category))].sort();

console.log("--- Database Categories ---");
console.log(dbCategories);

console.log("\n--- Mapping Analysis ---");

// Helper to simulate current logic
function checkCategoryMatch(product, category) {
    const pName = (product.name || "").toLowerCase();
    const pCat = (product.category || "").toLowerCase();
    const pDesc = (product.description || "").toLowerCase();

    switch (category) {
        case "AV BIÇAĞI ÇEŞİTLERİ":
            return pCat.includes("av") || pName.includes("av") || pName.includes("kamp") || pDesc.includes("avcı");
        case "KOMANDO BIÇAKLARI":
            return pName.includes("komando") || pName.includes("taktik") || pName.includes("asker") || pDesc.includes("kamuflaj") || pDesc.includes("kılıf") || pName.includes("kamp") || pCat.includes("kamp") || pCat.includes("av");
        // ... (simplified for check)
        default:
            // Simple contains check for others as a fallback approximation
            return pCat.includes(category.toLowerCase()) || pName.includes(category.toLowerCase());
    }
}

// Check what categories in DB map to what Static Category
// Ideally, we want to know: For each Static Category, what DB categories are being captured?
// And are there products in a DB category that are NOT being captured?

STATIC_CATEGORIES.forEach(staticCat => {
    // Find all products that match this static cat
    const matches = products.filter(p => checkCategoryMatch(p, staticCat));
    // Of these matches, what are their 'category' fields?
    const sourceCats = [...new Set(matches.map(p => p.category))];
    console.log(`\n[${staticCat}] captures products from DB categories:`);
    console.log(sourceCats);
});
