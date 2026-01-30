
const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../src/data/products.ts');

try {
    const fileContent = fs.readFileSync(PRODUCTS_PATH, 'utf-8');
    const categoryMatches = fileContent.match(/category":\s*"([^"]+)"/g);

    if (categoryMatches) {
        const categories = categoryMatches.map(m => m.match(/"([^"]+)"/)[1]);
        const uniqueCategories = [...new Set(categories)].sort();
        console.log("Unique Categories Found:", uniqueCategories);

        // Also check naming patterns for "Komando" like items
        // Since we can't easily parse the whole file structure with regex reliably for complex objects,
        // let's just dump some names that might be relevant.
        const nameMatches = fileContent.match(/name":\s*"([^"]+)"/g);
        if (nameMatches) {
            const names = nameMatches.map(m => m.match(/"([^"]+)"/)[1]);
            console.log("\nSample Names (first 20):", names.slice(0, 20));

            const komandoLike = names.filter(n => /komando|taktik|asker|rambo|survival/i.test(n));
            console.log("\nPotential 'Komando' Names:", komandoLike);
        }

    } else {
        console.log("No categories found.");
    }

} catch (err) {
    console.error("Error:", err);
}
