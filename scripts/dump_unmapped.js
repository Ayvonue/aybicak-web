
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

    // Strict Mapping based on DB Category primarily
    switch (category) {
        case "AV BIÇAĞI ÇEŞİTLERİ":
            return pCat === "av bıçağı" || (pCat === "bıçak" && (pName.includes("av") && !pName.includes("kamp")));
        case "KAMP BIÇAKLARI":
            return pCat === "kamp bıçağı" || pName.includes("kamp") || pName.includes("bushcraft");
        case "BUSHCRAFT BIÇAKLAR":
            return pName.includes("bushcraft") || pDesc.includes("bushcraft");
        case "KOMANDO BIÇAKLARI":
            return pName.includes("komando") || pName.includes("taktik") || pName.includes("asker") || pName.includes("bora");
        case "BALTA ÇEŞİTLERİ":
            return pName.includes("balta");
        case "ÇAKI ÇEŞİTLERİ":
            return pCat === "çakı" || pName.includes("çakı");
        case "KILIÇ ÇEŞİTLERİ":
            return pCat === "kılıç" || pName.includes("kılıç") || pName.includes("yatağan") || pName.includes("zülfikar");
        case "BIÇAK SETLERİ":
            return pCat.includes("set") || pName.includes("set");
        case "Altın İşlemeli Bıçaklar":
            return pName.includes("altın") || pDesc.includes("altın");
        case "SATIR":
            return pName.includes("satır");
        case "Ekmek Bıçakları":
            return pName.includes("ekmek");
        case "Şef Bıçakları":
            return pName.includes("şef") || pName.includes("chef") || (pCat.includes("mutfak") && !pName.includes("set"));
        case "Kurban Bıçakları":
            return pName.includes("kurban") || pName.includes("sıyırma") || pName.includes("yüzme");
        case "Döner Bıçağı":
            return pName.includes("döner");
        case "Sebze & Meyve Bıçakları":
            return pName.includes("sebze") || pName.includes("meyve") || pName.includes("soyma");
        case "MASAT":
            return pName.includes("masat") || pName.includes("bileme");
        case "MİNYATÜRLER":
            return pName.includes("minyatür") || pName.includes("mini");
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

const unmapped = products.filter(p => !STATIC_CATEGORIES.some(cat => checkCategoryMatch(p, cat)));

console.log(`Unmapped count: ${unmapped.length}`);
unmapped.forEach(p => console.log(`[${p.category}] ${p.name}`));
