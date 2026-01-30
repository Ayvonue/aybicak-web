
const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../src/data/products.ts');
const fileContent = fs.readFileSync(PRODUCTS_PATH, 'utf-8');
const match = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
const products = eval(match[1]);

function checkCategoryMatch(product, category) {
    const pName = (product.name || "").toLowerCase();
    const pCat = (product.category || "").toLowerCase();
    const pDesc = (product.description || "").toLowerCase();

    switch (category) {
        case "AV BIÇAĞI ÇEŞİTLERİ":
            // STRICT: Only explicitly "av bıçağı" OR generic "bıçak" that isn't something else
            if (pCat === "av bıçağı") return true;
            if (pCat === "bıçak") {
                if (pName.includes("kolye") || pName.includes("aşı") || pName.includes("karambit") || pName.includes("kama") || pName.includes("satır") || pName.includes("döner") || pName.includes("şef") || pName.includes("kamp") || pName.includes("bushcraft")) return false;
                return true;
            }
            return false;

        case "KAMP BIÇAKLARI":
            // STRICT: Only explicitly "kamp bıçağı"
            return pCat === "kamp bıçağı";

        case "BUSHCRAFT BIÇAKLAR":
            // Sub-segment of Kamp or explicitly named
            // If DB has "Kamp Bıçağı", do we assume Bushcraft are there?
            // Let's allow name match here as it's a sub-category likely not in strict DB types
            return pName.includes("bushcraft") || pDesc.includes("bushcraft");

        case "KOMANDO BIÇAKLARI":
            return pName.includes("komando") || pName.includes("taktik") || pName.includes("asker") || pName.includes("bora") || pName.includes("karambit");

        case "BALTA ÇEŞİTLERİ":
            return pName.includes("balta");

        case "ÇAKI ÇEŞİTLERİ":
            return pCat === "çakı";

        case "KILIÇ ÇEŞİTLERİ":
            return pCat === "kılıç";

        case "BIÇAK SETLERİ":
            return pCat.includes("set") || pName.includes("set");

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
    "BUSHCRAFT BIÇAKLAR", // kept for check
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

const unmapped = products.filter(p => !STATIC_CATEGORIES.some(cat => checkCategoryMatch(p, cat)));

console.log(`STRICT CHECK - Unmapped count: ${unmapped.length}`);
unmapped.forEach(p => console.log(`[${p.category}] ${p.name}`));
