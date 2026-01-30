
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../src/data/products.ts');
const fileContent = fs.readFileSync(productsPath, 'utf-8');

const match = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
if (!match) process.exit(1);

let products = eval(match[1]);

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

function checkCategoryMatch(product, category) {
    const pName = (product.name || "").toLowerCase();
    const pCat = (product.category || "").toLowerCase();
    const pDesc = (product.description || "").toLowerCase();

    switch (category) {
        case "AV BIÇAĞI ÇEŞİTLERİ":
            return pCat.includes("av") || pName.includes("av") || pName.includes("kamp");
        case "KOMANDO BIÇAKLARI":
            return pName.includes("komando") || pName.includes("taktik") || pName.includes("asker");
        case "BALTA ÇEŞİTLERİ":
            return pName.includes("balta") || pCat.includes("balta");
        case "ÇAKI ÇEŞİTLERİ":
            return pCat.includes("çakı") || pName.includes("çakı");
        case "KILIÇ ÇEŞİTLERİ":
            return pCat.includes("kılıç") || pName.includes("kılıç") || pName.includes("zülfikar");
        case "BIÇAK SETLERİ":
            return pCat.includes("set") || pName.includes("set") || pName.includes("takım");
        case "Altın İşlemeli Bıçaklar":
            return pName.includes("altın") || pName.includes("işleme") || pDesc.includes("altın");
        case "SATIR":
            return pName.includes("satır");
        case "Ekmek Bıçakları":
            return pName.includes("ekmek") || pDesc.includes("ekmek");
        case "Şef Bıçakları":
            return pName.includes("şef") || pName.includes("chef") || pCat.includes("mutfak");
        case "Kurban Bıçakları":
            return pName.includes("kurban") || pName.includes("yüzme") || pName.includes("sıyırma");
        case "Döner Bıçağı":
            return pName.includes("döner");
        case "Sebze & Meyve Bıçakları":
            return pName.includes("sebze") || pName.includes("meyve") || pName.includes("soyma");
        case "MASAT":
            return pName.includes("masat") || pName.includes("bileme");
        case "MİNYATÜRLER":
            return pName.includes("minyatür") || pName.includes("mini");
        case "SALLAMA":
            return pName.includes("sallama");
        case "ZIRH ÇEŞİTLERİ":
            return pName.includes("zırh");
        default:
            return true;
    }
}

console.log("--- Category Match Counts ---");
STATIC_CATEGORIES.forEach(cat => {
    const count = products.filter(p => checkCategoryMatch(p, cat)).length;
    console.log(`${cat}: ${count}`);
});
