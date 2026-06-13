// Ürün verisindeki yazım hatalarını ve yanlış kategorileri düzeltir.
// Kullanım: node scripts/fix_data_quality.mjs

import fs from "node:fs/promises";
import path from "node:path";

const FILE = path.resolve(import.meta.dirname, "../src/data/products.ts");

let source = await fs.readFile(FILE, "utf8");

// 1) Yazım hataları (ad + açıklamalarda)
const typoFixes = [
    [/Grevürlü/g, "Gravürlü"],
    [/Grevurlu/g, "Gravürlü"],
    [/Buschcarf/g, "Bushcraft"],
    [/Çakıı/g, "Çakı"],
];
for (const [pattern, replacement] of typoFixes) {
    source = source.replace(pattern, replacement);
}

// 2) name/description alanlarındaki çift boşlukları tekille
source = source.replace(/"(name|description)": "([^"]*)"/g, (m, key, value) => {
    return `"${key}": "${value.replace(/\s{2,}/g, " ").trim()}"`;
});

// 3) Adında kılıç/katana geçen ürünler "Kılıç" kategorisine taşınır
let categoryFixCount = 0;
source = source.replace(
    /("name": "([^"]*)",[\s\S]*?"category": ")Bıçak(")/g,
    (match, prefix, name, suffix) => {
        if (/kılı[cç]|katana/i.test(name)) {
            categoryFixCount++;
            return `${prefix}Kılıç${suffix}`;
        }
        return match;
    }
);

await fs.writeFile(FILE, source);
console.log(`Tamamlandı. ${categoryFixCount} ürün Kılıç kategorisine taşındı.`);
