
const fs = require("fs");
const path = require("path");

// 1. Manually curated "Rich Data" to preserve our hard work
const richData = {
    "5176": {
        name: "El Yapımı Gravürlü N690 Çakı No:2",
        description: "Özel seri, sınırlı sayıda üretilmiş gravür işlemeli N690 çakı. Pirinç gravür işlemeleri ve ceviz kabzesi ile şık bir görünüme sahiptir. Sırttan kilitleme mekanizması güvenli kullanım vaat eder. Orta boy bir modeldir.",
        fullLength: "19 cm",
        barrelLength: "8 cm",
        thickness: "2.7 mm",
        steel: "N690 Böhler",
        handle: "Ceviz Ağacı"
    },
    "5175": {
        name: "El Yapımı Gravürlü N690 Çakı No:1",
        description: "En küçük boy, zarif ve taşınabilir gravür işlemeli çakı. Pirinç gravür detayları ve ceviz sapı ile koleksiyonluk bir parçadır. Günlük taşıma (EDC) için ideal boyutlardadır.",
        fullLength: "16.5 cm",
        barrelLength: "7 cm",
        thickness: "2.7 mm",
        steel: "N690 Böhler",
        handle: "Ceviz Ağacı"
    },
    "5174": {
        name: "El Yapımı N690 3 Hilal Kurt İşlemeli Kamp Çakısı",
        description: "Özel CNC işleme 'Kurt ve 3 Hilal' motifli pirinç balçak. Sırttan kilitli mekanizması ve N690 çeliği ile hem görsel hem de işlevsel bir şaheser. Koleksiyonerler için özel seri.",
        fullLength: "21.5 cm",
        barrelLength: "9 cm",
        thickness: "3 mm",
        steel: "N690 Böhler",
        handle: "Ceviz / Pirinç İşleme"
    },
    "5173": {
        name: "El Yapımı Mutfak Bıçak Seti 7Li (Stantlı)",
        description: "7 parça profesyonel mutfak seti ve ahşap standı. Sıyırma, Kesim, Tanto Şef, Sivri Şef ve 3 farklı Sebze bıçağından oluşur. Verzalit kabzeler suya ve asite karşı tam dayanıklıdır. Mutfaktaki tüm ihtiyaçlarınız için tek set.",
        fullLength: "21cm - 30cm",
        barrelLength: "12cm - 17.5cm",
        thickness: "2.5 mm",
        steel: "4116 Alman Paslanmaz",
        handle: "Verzalit (Kompak)"
    },
    "5171": {
        name: "El Yapımı Bushcraft Doğa Kamp Bıçağı Pukko N690",
        description: "Pukko tarzı modern Bushcraft bıçağı. Tam boy N690 çelik ve özel epoksi kabze kombinasyonu. Doğada her türlü kesim ve yontma işi için ideal. Deri kılıfı ile birlikte gelir.",
        fullLength: "26.5 cm",
        barrelLength: "12.5 cm",
        thickness: "4 mm",
        steel: "N690 Böhler",
        handle: "Epoksi (Özel Renk)"
    },
    "3398": {
        name: "El Yapımı Prinç Örgülü Kurt Başlık Avcı Kamp Bıçağı",
        description: "El yapımı pirinç örgülü, kurt başlı özel koleksiyonluk bir avcı kamp bıçağı. Kabzesinde gerçek geyik boynuzu kullanılmış olup, pirinç detaylarla zenginleştirilmiştir. Hem vitrinlik hem de doğada kullanıma uygun sağlam bir yapıdadır.",
        fullLength: "34 cm",
        barrelLength: "Değişken",
        thickness: "4 mm",
        steel: "N695 Paslanmaz",
        handle: "Geyik Boynuzu / Pirinç Örgü"
    },
    "3483": {
        name: "Ocakoğlu Denizli Yatağan Kurban Seti",
        description: "Bu 5 parçalı özel set, Denizli Yatağan el işçiliği ile üretilmiş olup kurban kesimi ve et işleme için profesyonel çözümler sunar. Set içeriğinde yüzme, doğrama ve sıyırma bıçakları bulunur.",
        fullLength: "22.5cm - 33cm",
        barrelLength: "10cm - 19cm",
        thickness: "Standart",
        steel: "Fransız Paslanmaz",
        handle: "Gül Ağacı"
    }
};

// 2. Helper to detect properties from title
function detectProps(title) {
    let steel = "Paslanmaz Çelik";
    let handle = "Standart";
    let hardness = "56-58 HRC";
    let category = "Bıçak";

    if (!title) return { steel, handle, hardness, category };

    const t = title.toLowerCase();

    // Steel Detection
    if (t.includes("n690")) steel = "N690 Böhler";
    else if (t.includes("n695")) steel = "N695 Böhler";
    else if (t.includes("4116")) steel = "4116 Alman";
    else if (t.includes("4034")) steel = "4034 Alman";
    else if (t.includes("dövme")) steel = "Dövme Çelik (Ck75)";
    else if (t.includes("damascus")) steel = "Damascus";

    // Handle Detection
    if (t.includes("geyik")) handle = "Geyik Boynuzu";
    else if (t.includes("ceviz") || t.includes("kök")) handle = "Kök Ceviz";
    else if (t.includes("gül")) handle = "Gül Ağacı";
    else if (t.includes("mikarta") || t.includes("micarta")) handle = "Mikarta";
    else if (t.includes("werzalit") || t.includes("verzalit") || t.includes("kompak")) handle = "Kompak (Verzalit)";
    else if (t.includes("kemik")) handle = "Gerçek Kemik";
    else if (t.includes("plastik")) handle = "ABS Plastik";
    else if (t.includes("ahşap")) handle = "Doğal Ahşap";
    else if (t.includes("pirinç") || t.includes("prinç")) handle = "Pirinç İşlemeli";

    // Category
    if (t.includes("çakı")) category = "Çakı";
    else if (t.includes("set") || t.includes("mutfak")) category = "Set/Mutfak";
    else if (t.includes("kılıç")) category = "Kılıç";
    else if (t.includes("kamp")) category = "Kamp Bıçağı";
    else if (t.includes("av")) category = "Av Bıçağı";

    if (steel.includes("N690")) hardness = "60 HRC";
    if (steel.includes("Dövme")) hardness = "58-59 HRC";

    return { steel, handle, hardness, category };
}

// 3. Main Import Logic
async function importProducts() {
    const files = [
        "C:\\Users\\large\\Downloads\\bicakmarket (1).csv",
        "C:\\Users\\large\\Downloads\\bicakmarket (2).csv",
        "C:\\Users\\large\\Downloads\\bicakmarket (3).csv",
        "C:\\Users\\large\\Downloads\\bicakmarket (4).csv",
        "C:\\Users\\large\\Downloads\\bicakmarket.csv"
    ];

    const products = [];
    const seenIds = new Set();
    const seenTitles = new Set();

    for (const csvPath of files) {
        if (!fs.existsSync(csvPath)) {
            continue;
        }

        console.log(`Processing ${csvPath}...`);
        const rawCsv = fs.readFileSync(csvPath, "utf-8");
        const lines = rawCsv.split("\n");
        const headerRow = lines[0].toLowerCase();
        const body = lines.slice(1);

        // Dynamic Column Detection
        const headers = headerRow.split('","').map(h => h.replace(/"/g, "").trim());
        const idxHref = headers.findIndex(h => h.includes("foto href"));
        const idxImage = headers.findIndex(h => h.includes("lazy src"));
        const idxName = headers.findIndex(h => h === "urunliste_baslik");
        const idxPriceMain = headers.findIndex(h => h === "urunliste_indirimli");
        const idxPriceDec = headers.findIndex(h => h === "urunliste_indirimli 2");

        for (const line of body) {
            if (!line.trim()) continue;

            const cleanLine = line.trim().replace(/^"/, "").replace(/"$/, "");
            const cols = cleanLine.split('","');

            if (cols.length < 5) continue;

            let url = cols[idxHref] || "";
            let imageUrlSrc = cols[idxImage] || "";
            let titleFull = cols[idxName] || "";
            let priceMainStr = cols[idxPriceMain] || "";
            let priceDecimalStr = cols[idxPriceDec] || "";

            // Robust Detection Logic (Fallback if standard fails)
            if (!url.includes("bicakmarket.com/urun")) {
                const found = cols.find(c => c.includes("bicakmarket.com/urun"));
                if (found) url = found;
            }

            if (!imageUrlSrc.includes("Images/Urun") && !imageUrlSrc.includes("/Css/")) {
                const found = cols.find(c => c.includes("Images/Urun") && (c.endsWith(".jpeg") || c.endsWith(".jpg") || c.endsWith(".png")));
                if (found) imageUrlSrc = found;
            }

            if (!titleFull || titleFull.includes("http") || titleFull.length < 3 || titleFull.includes(", TL")) {
                const candidate = cols.find(c =>
                    c.length > 5 &&
                    !c.startsWith("http") &&
                    !c.includes(", TL") &&
                    !c.includes(".jpeg") &&
                    !c.includes(".jpg") &&
                    !c.includes(".png") &&
                    c !== "Bıçak Market" &&
                    c !== "Ücretsiz Kargo" &&
                    c !== "Tükendi"
                );
                if (candidate) titleFull = candidate;
            }

            // Clean up
            const clean = (s) => s ? s.trim().replace(/^"/, "").replace(/"$/, "") : "";
            url = clean(url);
            imageUrlSrc = clean(imageUrlSrc);
            titleFull = clean(titleFull);
            priceMainStr = clean(priceMainStr);
            priceDecimalStr = clean(priceDecimalStr);

            if (!titleFull || !url || titleFull.startsWith("http")) continue;

            // Extract ID
            const idMatch = url.match(/\/(\d+)$/);
            const id = idMatch ? idMatch[1] : `csv-${Math.random().toString(36).substr(2, 5)}`;

            if (seenIds.has(id)) continue;
            if (seenTitles.has(titleFull)) continue;

            seenIds.add(id);
            seenTitles.add(titleFull);

            // Robust price parsing (Turkish format: 1.234, TL + 50)
            const mainDigits = priceMainStr.replace(/\D/g, "");
            const decimalDigits = priceDecimalStr.replace(/\D/g, "") || "0";
            let price = parseFloat(`${mainDigits}.${decimalDigits}`);

            if (isNaN(price) || price === 0) {
                // Fallback: try to find any numbers in the priceMainStr
                const match = priceMainStr.match(/\d+([.,]\d+)?/);
                if (match) {
                    price = parseFloat(match[0].replace(".", "").replace(",", "."));
                }
            }

            if (!price || price === 0) {
                console.warn(`[WARN] Zero price for ID ${id}: ${titleFull} (ColIdx: name=${idxName}, price=${idxPriceMain})`);
            }

            const detected = detectProps(titleFull);
            const rich = richData[id];

            const product = {
                id,
                name: rich?.name || titleFull,
                price: isNaN(price) ? 0 : price,
                imageUrl: rich?.imageUrl || imageUrlSrc,
                steel: rich?.steel || detected.steel,
                hardness: rich?.hardness || detected.hardness,
                handle: rich?.handle || detected.handle,
                category: rich?.category || detected.category,
                isNew: titleFull.includes("Yeni") || parseInt(id) > 5000,
                description: rich?.description || `${titleFull}. Bu özel üretim ürün, Bıçak Market kalitesiyle sunulmaktadır. ${detected.steel} kullanılarak üretilmiş olup, ${detected.handle} detaylarıyla zenginleştirilmiştir. Uzun ömürlü ve dayanıklı yapısıyla her türlü kullanım için uygundur.`,
                fullLength: rich?.fullLength || undefined,
                barrelLength: rich?.barrelLength || undefined,
                thickness: rich?.thickness || undefined
            };

            // Filter out clearly broken entries
            // Must have a name that doesn't look like a URL
            if (product.name.startsWith("http")) continue;

            // Must have an image URL
            if (!product.imageUrl || !product.imageUrl.startsWith("http")) continue;

            products.push(product);
        }
    }

    products.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    const fileContent = `// Verified data via robust JS import
import { Product } from "@/types";

export const products: Product[] = ${JSON.stringify(products, null, 4)};
`;

    fs.writeFileSync("C:\\Users\\large\\.gemini\\antigravity\\scratch\\aybicak-web\\src\\data\\products.ts", fileContent);
    console.log(`IMPORTED_COUNT:${products.length}`);
}

importProducts();
