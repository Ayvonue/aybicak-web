
const fs = require('fs');
const path = require('path');

// Determine path
const productsPath = path.join(__dirname, '../src/data/products.ts');
const fileContent = fs.readFileSync(productsPath, 'utf-8');

// Extract the array part using regex
// Matches: export const products: Product[] = [ ... ];
const match = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);

if (!match) {
    console.error("Could not find products array in file.");
    process.exit(1);
}

const productArrayString = match[1];

// Safely evaluate the array string to get the object
// Note: This assumes the content inside is valid JS object literals, which it is in this project.
let products = [];
try {
    products = eval(productArrayString);
} catch (e) {
    console.error("Error parsing product data:", e);
    process.exit(1);
}

// Function to optimize a single product
function optimizeProduct(product) {
    let images = product.images || [];
    if (images.length === 0 && product.imageUrl) {
        images = [product.imageUrl];
    }

    // Deduplicate images
    images = [...new Set(images)];

    let mainImage = product.imageUrl;

    // Logic: Find the best "full view" image.
    const getMainFilename = (url) => url.split('/').pop() || "";

    const currentMainFilename = getMainFilename(mainImage);

    // Check if it starts with 'b' and has digits
    const bMatch = currentMainFilename.match(/^b(\d+.*\.(?:jpg|jpeg|png|webp))$/i);

    if (bMatch) {
        const potentialNonB = bMatch[1]; // The filename without 'b'
        // Find if this exists in images
        const betterImage = images.find((img) => img.endsWith("/" + potentialNonB) || img.endsWith(potentialNonB));

        if (betterImage) {
            // console.log(`Swapping [${product.id}]: ${currentMainFilename} -> ${getMainFilename(betterImage)}`);
            mainImage = betterImage;
        }
    }

    // Ensure mainImage is first in images list
    images = images.filter((img) => img !== mainImage);
    images.unshift(mainImage);

    // Update product
    product.imageUrl = mainImage;
    product.images = images;

    return product;
}

const optimizedProducts = products.map(optimizeProduct);

// Reconstruct file
const newFileContent = `import { Product } from "@/types";

export const products: Product[] = ${JSON.stringify(optimizedProducts, null, 4)};
`;

fs.writeFileSync(productsPath, newFileContent, 'utf-8');
console.log(`Optimized ${optimizedProducts.length} products. Saved to products.ts`);
