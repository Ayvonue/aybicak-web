import { useMemo, useState } from "react";
import { Product, FilterState } from "@/types";

export function useKnifeFilter(products: Product[]) {
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        minPrice: 0,
        maxPrice: 100000,
        steel: [],
        handle: [],
        category: [],
    });

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            // Search
            const matchesSearch = product.name
                .toLowerCase()
                .includes(filters.search.toLowerCase());

            // Price
            const matchesPrice =
                product.price >= filters.minPrice && product.price <= filters.maxPrice;

            // Steel
            const matchesSteel =
                filters.steel.length === 0 || filters.steel.includes(product.steel);

            // Handle
            const matchesHandle =
                filters.handle.length === 0 || filters.handle.includes(product.handle);

            // Category (Smart Mapping)
            let matchesCategory = true;
            if (filters.category.length > 0) {
                const selectedCat = filters.category[0]; // Single select assumed for now
                matchesCategory = checkCategoryMatch(product, selectedCat);
            }

            return matchesSearch && matchesPrice && matchesSteel && matchesHandle && matchesCategory;
        });
    }, [products, filters]);

    const updateFilter = (key: keyof FilterState, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: "",
            minPrice: 0,
            maxPrice: 100000,
            steel: [],
            handle: [],
            category: [],
        });
    };

    return { filteredProducts, filters, updateFilter, clearFilters, setFilters };
}

// Smart Mapping Logic
// Smart Mapping Logic
// Smart Mapping Logic
// Smart Mapping Logic
// Smart Mapping Logic
function checkCategoryMatch(product: Product, category: string): boolean {
    const pName = product.name.toLowerCase();
    const pCat = product.category.toLowerCase();
    const pDesc = (product.description || "").toLowerCase();

    // STRICT ALIGNMENT WITH BICAKMARKET DATA
    // We trust the 'category' field from the database as the primary source of truth.

    switch (category) {
        case "AV BIÇAĞI ÇEŞİTLERİ":
            // STRICT: Only explicitly "av bıçağı" in DB.
            if (pCat === "av bıçağı") return true;
            // Fallback: If category is generic "Bıçak" but name clearly indicates hunting/av
            // We exclude items that belong to other specific categories to avoid duplication.
            if (pCat === "bıçak") {
                if (pName.includes("kolye") || pName.includes("aşı") || pName.includes("karambit") || pName.includes("kama") || pName.includes("satır") || pName.includes("döner") || pName.includes("şef") || pName.includes("kamp") || pName.includes("bushcraft")) return false;
                return true; // Default home for generic "Bıçak"
            }
            return false;

        case "KAMP BIÇAKLARI":
            // STRICT: Only explicitly "kamp bıçağı" in DB.
            return pCat === "kamp bıçağı";

        case "KOMANDO BIÇAKLARI":
            // Sub-segment. Defined by keywords.
            return pName.includes("komando") || pName.includes("taktik") || pName.includes("asker") || pName.includes("bora") || pName.includes("karambit");

        case "BUSHCRAFT BIÇAKLAR":
            // Sub-segment.
            return pName.includes("bushcraft") || pDesc.includes("bushcraft");

        case "ÇAKI ÇEŞİTLERİ":
            // STRICT: "Çakı" + Aşı Bıçakları (often folded)
            return pCat === "çakı" || (pCat === "bıçak" && pName.includes("aşı"));

        case "KILIÇ ÇEŞİTLERİ":
            // STRICT: "Kılıç" + Kama/Zülfikar from generic "Bıçak"
            return pCat === "kılıç" || (pCat === "bıçak" && (pName.includes("kama") || pName.includes("zülfikar") || pName.includes("yatağan")));

        case "BIÇAK SETLERİ":
            // STRICT: Sets
            return pCat.includes("set") || pName.includes("set");

        case "BALTA ÇEŞİTLERİ":
            return pName.includes("balta");

        case "Altın İşlemeli Bıçaklar":
            return pName.includes("altın") || pDesc.includes("altın");

        case "SATIR":
            return pName.includes("satır") || pName.includes("zırh");

        case "Ekmek Bıçakları":
            return pName.includes("ekmek");

        case "Şef Bıçakları":
            // Includes Chef knives and explicit "Nusret" style
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
