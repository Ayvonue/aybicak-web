
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../src/data/products.ts');
const fileContent = fs.readFileSync(productsPath, 'utf-8');

const match = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
if (!match) {
    console.error("Could not find products array.");
    process.exit(1);
}

let products = [];
try {
    products = eval(match[1]);
} catch (e) {
    console.error("Error parsing products:", e);
    process.exit(1);
}

let changedCount = 0;

function isBImage(url) {
    const filename = url.split('/').pop() || "";
    return filename.toLowerCase().startsWith('b') && /\d/.test(filename);
}

const optimizeProduct = (product) => {
    let images = product.images || [];
    if (images.length === 0 && product.imageUrl) images = [product.imageUrl];

    // Deduplicate
    images = [...new Set(images)];

    const currentMain = product.imageUrl;
    let newMain = currentMain;

    // Check if current is 'b' image
    if (isBImage(currentMain)) {
        // Find ANY non-b image
        const nonB = images.find(img => !isBImage(img));
        if (nonB) {
            newMain = nonB;
            // console.log(`[${product.id}] Swapped ${currentMain.split('/').pop()} -> ${newMain.split('/').pop()}`);
            changedCount++;
        }
    }

    // Reorder: New Main first
    images = images.filter(img => img !== newMain);
    images.unshift(newMain);

    return {
        ...product,
        imageUrl: newMain,
        images: images
    };
};

const optimizedProducts = products.map(optimizeProduct);

const newContent = `import { Product } from "@/types";

export const products: Product[] = ${JSON.stringify(optimizedProducts, null, 4)};
`;

fs.writeFileSync(productsPath, newContent, 'utf-8');
console.log(`Processed ${products.length} items. Swapped images for ${changedCount} items.`);
