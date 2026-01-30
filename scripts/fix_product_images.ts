
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../src/data/products.ts');
const fileContent = fs.readFileSync(productsPath, 'utf-8');

const match = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
if (!match) process.exit(1);

let products = eval(match[1]);

// List of images identified as "irrelevant/spam" based on frequency analysis
const SPAM_IMAGES = [
    "b05042022155238.jpeg",
    "b15112023202500.jpeg",
    "b23112022154516.jpeg",
    "b23112022154915.jpeg",
    "b15102024110840.jpeg",
    "b03042024160910.jpeg",
    "b03042024155432.jpeg",
    "b03042024153438.jpeg"
];

let fixedCount = 0;
let cleanedCount = 0;

products = products.map(p => {
    let images = p.images || [];
    let imageUrl = p.imageUrl;
    let originalImagesLen = images.length;

    // 1. Filter out spam images and invalid URLs
    images = images.filter(img => {
        if (!img) return false;
        if (!img.startsWith('http')) return false; // Remove "Bıçak Market" etc.
        const filename = img.split('/').pop();
        if (SPAM_IMAGES.includes(filename)) return false;
        return true;
    });

    if (images.length !== originalImagesLen) {
        cleanedCount++;
    }

    // 2. Fix Main Image URL
    // If main image is empty, invalid, or is one of the spam images -> Replace it
    const isMainInvalid = !imageUrl || !imageUrl.startsWith('http') || SPAM_IMAGES.includes(imageUrl.split('/').pop() || "");

    if (isMainInvalid) {
        if (images.length > 0) {
            // Promote first valid image
            imageUrl = images[0];
            fixedCount++;
        } else {
            // No images available at all
            imageUrl = "";
        }
    }

    // 3. Ensure uniqueness again
    images = [...new Set(images)];

    return {
        ...p,
        imageUrl,
        images
    };
});

const newContent = `import { Product } from "@/types";

export const products: Product[] = ${JSON.stringify(products, null, 4)};
`;

fs.writeFileSync(productsPath, newContent, 'utf-8');
console.log(`Cleaned spam images from ${cleanedCount} products.`);
console.log(`Fixed main image for ${fixedCount} products.`);
