
const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../src/data/products.ts');
const USE_FILTERS_PATH = path.join(__dirname, '../src/hooks/useKnifeFilter.ts');

const fileContent = fs.readFileSync(PRODUCTS_PATH, 'utf-8');
const match = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
const products = eval(match[1]);

// REPLICATE THE LOGIC FROM useKnifeFilter.ts EXACTLY
function checkCategoryMatch(product, category) {
    const pName = (product.name || "").toLowerCase();
    const pCat = (product.category || "").toLowerCase();
    const pDesc = (product.description || "").toLowerCase();

    // Strict Mapping based on DB Category primarily
    switch (category) {
        case "AV BIÇAĞI ÇEŞİTLERİ":
            // Include 'Av Bıçağı' and general 'Bıçak' if it looks like a hunting knife or has no specific home
            // Also Catch-all for "Bıçak" category items that aren't mapped elsewhere (Bel bıçağı, etc)
            if (pCat === "av bıçağı") return true;
            if (pCat === "bıçak") {
                // Exclude specific types that belong elsewhere
                if (pName.includes("kolye") || pName.includes("aşı") || pName.includes("karambit") || pName.includes("kama") || pName.includes("satır") || pName.includes("döner") || pName.includes("şef")) return false;
                // Default remaining "Bıçak" to Av Bıçağı (Bel bıçakları, etc)
                return true;
            }
            return pName.includes("av") && !pName.includes("kamp");

        case "KAMP BIÇAKLARI":
            return pCat === "kamp bıçağı" || pName.includes("kamp") || pName.includes("bushcraft");

        case "BUSHCRAFT BIÇAKLAR":
            return pName.includes("bushcraft") || pDesc.includes("bushcraft");

        case "KOMANDO BIÇAKLARI":
            // Strictly Komando/Tactical + Karambit
            return pName.includes("komando") || pName.includes("taktik") || pName.includes("asker") || pName.includes("bora") || pName.includes("karambit");

        case "BALTA ÇEŞİTLERİ":
            return pName.includes("balta");

        case "ÇAKI ÇEŞİTLERİ":
            return pCat === "çakı" || pName.includes("çakı") || pName.includes("aşı"); // Aşı bıçakları are folding

        case "KILIÇ ÇEŞİTLERİ":
            return pCat === "kılıç" || pName.includes("kılıç") || pName.includes("yatağan") || pName.includes("zülfikar") || pName.includes("kama");

        case "BIÇAK SETLERİ":
            return pCat.includes("set") || pName.includes("set") || pName.includes("kombin");

        case "Altın İşlemeli Bıçaklar":
            return pName.includes("altın") || pDesc.includes("altın");

        case "SATIR":
            return pName.includes("satır") || pName.includes("zırh");

        case "Ekmek Bıçakları":
            return pName.includes("ekmek");

        case "Şef Bıçakları":
            return pName.includes("şef") || pName.includes("chef") || (pCat.includes("mutfak") && !pName.includes("set")) || pName.includes("doğrama") || pName.includes("nusret");

        case "Kurban Bıçakları":
            return pName.includes("kurban") || pName.includes("sıyırma") || pName.includes("yüzme");

        case "Döner Bıçağı":
            return pName.includes("döner");

        case "Sebze & Meyve Bıçakları":
            return pName.includes("sebze") || pName.includes("meyve") || pName.includes("soyma");

        case "MASAT":
            return pName.includes("masat") || pName.includes("bileme");

        case "MİNYATÜRLER":
            return pName.includes("minyatür") || pName.includes("mini") || pName.includes("kolye");

        case "SALLAMA":
            return pName.includes("sallama") || pCat.includes("sallama");

        case "ZIRH ÇEŞİTLERİ":
            return pName.includes("zırh");

        default:
            return false;
    }
}

const STATIC_CATEGORIES = [
    "AV BIÇAĞI ÇEŞİTLERİ",
    "KAMP BIÇAKLARI",
    "KOMANDO BIÇAKLARI",
    "BUSHCRAFT BIÇAKLAR",
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

console.log("--- FINAL CATEGORY AUDIT ---");
let totalMapped = 0;
const unmappedProducts = [];

STATIC_CATEGORIES.forEach(cat => {
    const matches = products.filter(p => checkCategoryMatch(p, cat));
    console.log(`[${cat.padEnd(25)}] -> ${matches.length} products`);
    if (matches.length < 3 && matches.length > 0) {
        console.log("   (WARNING: Low count, possible mismatch)");
        matches.forEach(m => console.log(`   - ${m.name}`));
    }
});

// Check coverage
products.forEach(p => {
    let isMapped = false;
    for (const cat of STATIC_CATEGORIES) {
        if (checkCategoryMatch(p, cat)) {
            isMapped = true;
            break;
        }
    }
    if (!isMapped) {
        unmappedProducts.push(p);
    }
});

console.log(`\nTotal Products: ${products.length}`);
console.log(`Unmapped Products: ${unmappedProducts.length}`);

if (unmappedProducts.length > 0) {
    console.log("--- UNMAPPED SAMPLES ---");
    unmappedProducts.slice(0, 10).forEach(p => console.log(`[${p.category}] ${p.name}`));
}
