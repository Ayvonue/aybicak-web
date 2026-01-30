import fs from "fs";
import path from "path";

// 1. Manually curated "Rich Data" to preserve our hard work
const richData: Record<string, any> = {
    "5176": {
        description: "Özel seri, sınırlı sayıda üretilmiş gravür işlemeli N690 çakı. Pirinç gravür işlemeleri ve ceviz kabzesi ile şık bir görünüme sahiptir. Sırttan kilitleme mekanizması güvenli kullanım vaat eder. Orta boy bir modeldir.",
        fullLength: "19 cm",
        barrelLength: "8 cm",
        thickness: "2.7 mm",
        steel: "N690 Böhler",
        handle: "Ceviz Ağacı"
    },
    "5175": {
        description: "En küçük boy, zarif ve taşınabilir gravür işlemeli çakı. Pirinç gravür detayları ve ceviz sapı ile koleksiyonluk bir parçadır. Günlük taşıma (EDC) için ideal boyutlardadır.",
        fullLength: "16.5 cm",
        barrelLength: "7 cm",
        thickness: "2.7 mm",
        steel: "N690 Böhler",
        handle: "Ceviz Ağacı"
    },
    // Add logic to merge or keep this data
};

// 2. Helper to detect properties from title
function detectProps(title: string) {
    let steel = "Paslanmaz Çelik";
    let handle = "Standart";
    let hardness = "56-58 HRC";
    let category = "Bıçak";

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

    // Category Detection (Priority Order)
    if (t.includes("çakı")) category = "Çakı";
    else if (t.includes("set") || t.includes("mutfak") || t.includes("şef")) category = "Set/Mutfak";
    // Check for swords BEFORE generic "av bıçağı" or fallbacks
    else if (t.includes("kılıç") || t.includes("kilic") || t.includes("kılıc") || t.includes("zülfikar") || t.includes("yalman") || t.includes("yatağan kılıcı")) category = "Kılıç";
    else if (t.includes("kamp") || t.includes("pala")) category = "Kamp Bıçağı";
    else if (t.includes("av") || t.includes("avcı") || t.includes("yüzme")) category = "Av Bıçağı";
    else if (t.includes("tant")) category = "Tanto";

    // Explicit overrides for specific ambiguous terms
    if (t.includes("zülfikar") && !category.includes("Set")) category = "Kılıç";



    // Hardness Tweaks
    if (steel.includes("N690")) hardness = "60 HRC";
    if (steel.includes("Dövme")) hardness = "58-59 HRC";

    return { steel, handle, hardness, category };
}

// 3. Scraping Helper
async function scrapeImages(url: string): Promise<string[]> {
    if (!url || !url.startsWith("http")) return [];

    // console.log(`Scraping images from: ${url}`);

    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (!res.ok) {
            // console.error(`Failed to fetch ${url}: ${res.status}`);
            return [];
        }

        const html = await res.text();

        // Find all /Images/Urun/... jpg/png links
        const regex = /(?:src|href|data-rel)=["'](https?:\/\/www\.bicakmarket\.com)?(\/?Images\/Urun\/[^"']+\.(?:jpeg|jpg|png))/gi;

        const found = new Set<string>();
        let match;
        while ((match = regex.exec(html)) !== null) {
            let relativePath = match[2];
            if (!relativePath.startsWith("/")) relativePath = "/" + relativePath;
            const fullUrl = `https://www.bicakmarket.com${relativePath}`;
            found.add(fullUrl);
        }

        return Array.from(found).slice(0, 8); // Limit to 8 images
    } catch (e) {
        // console.error(`Error scraping ${url}:`, e);
        return [];
    }
}

// 4. Main Import Logic
async function importProducts() {
    const files = [
        "C:\\Users\\large\\Downloads\\bicakmarket.csv",
        "C:\\Users\\large\\Downloads\\bicakmarket (1).csv",
        "C:\\Users\\large\\Downloads\\bicakmarket (2).csv",
        "C:\\Users\\large\\Downloads\\bicakmarket (3).csv",
        "C:\\Users\\large\\Downloads\\bicakmarket (4).csv",
    ];

    const products: any[] = [];
    const seenIds = new Set();
    let counter = 0;

    for (const csvPath of files) {
        if (!fs.existsSync(csvPath)) continue;

        console.log(`Processing ${csvPath}...`);
        const rawCsv = fs.readFileSync(csvPath, "utf-8");
        const lines = rawCsv.split("\n").slice(1);

        for (const line of lines) {
            if (!line.trim()) continue;

            const matches: string[] = [];
            const quoteRegex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
            let m;
            while ((m = quoteRegex.exec(line)) !== null) {
                matches.push(m[1] || m[0]);
            }

            if (matches.length < 5) continue;

            const clean = (s: string) => s ? s.replace(/^"|"$/g, "").trim() : "";

            // 0: URL
            // 2: baslik src (Image)
            // 3: baslik (Title)
            // 4: indirimli (Price)

            const url = clean(matches[0]);
            const imageUrlSrc = clean(matches[2]);
            const titleFull = clean(matches[3]);
            const priceStr = clean(matches[4]);

            const idMatch = url.match(/\/(\d+)$/);
            const id = idMatch ? idMatch[1] : `csv-${Math.random().toString(36).substr(2, 5)}`;

            if (seenIds.has(id)) continue;
            seenIds.add(id);

            let price = 0;
            if (priceStr) {
                // "1.225, TL" -> "1225. TL" -> 1225
                let p = priceStr.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
                // Remove trailing dot if exists
                if (p.endsWith(".")) p = p.slice(0, -1);
                price = parseFloat(p);
            }

            const detected = detectProps(titleFull);
            const rich = richData[id];

            let images: string[] = [];
            if (imageUrlSrc && imageUrlSrc.startsWith("http")) {
                images.push(imageUrlSrc);
            }

            process.stdout.write(`Processing ${id}... `);

            // Limit scraping to avoid timeout? The user said "baslat" (start), assume full run.
            // But let's verify if we should do all. 
            // We'll do it with a 100ms delay to be safe.
            await new Promise(r => setTimeout(r, 100));

            const scraped = await scrapeImages(url);
            if (scraped.length > 0) {
                const set = new Set(images);
                scraped.forEach(s => set.add(s));
                images = Array.from(set);
                process.stdout.write(`Found ${scraped.length} images. \n`);
            } else {
                process.stdout.write(`No extra images. \n`);
            }

            if (images.length === 0 && imageUrlSrc) {
                images = [imageUrlSrc];
            }

            const product = {
                id,
                name: titleFull,
                price,
                imageUrl: imageUrlSrc,
                images: images,
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

            products.push(product);
            counter++;
            // Limit for testing? No, user wants real data.
        }
    }

    console.log(`\nImported ${counter} items.`);

    const fileContent = `import { Product } from "@/types";

export const products: Product[] = ${JSON.stringify(products, null, 4)};
`;

    fs.writeFileSync("C:\\Users\\large\\.gemini\\antigravity\\scratch\\aybicak-web\\src\\data\\products.ts", fileContent);
    console.log(`Successfully saved to src/data/products.ts`);
}

importProducts();
