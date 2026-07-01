import { products as fileProducts } from "@/data/products";
import { getSql, isDbConfigured } from "@/lib/db";
import type { Product } from "@/types";

// Ürün verisinin tek erişim noktası. DB yapılandırılmışsa oradan, aksi halde
// (veya DB hatasında) products.ts dosyasından okur — site her durumda çalışır.

interface ProductRow {
    id: string;
    name: string;
    price: string | number;
    image_url: string | null;
    steel: string | null;
    hardness: string | null;
    handle: string | null;
    category: string | null;
    is_new: boolean;
    description: string | null;
    full_length: string | null;
    barrel_length: string | null;
    thickness: string | null;
}

function rowToProduct(r: ProductRow): Product {
    return {
        id: r.id,
        name: r.name,
        price: Number(r.price),
        imageUrl: r.image_url || "",
        steel: r.steel || "",
        hardness: r.hardness || "",
        handle: r.handle || "",
        category: r.category || "",
        isNew: r.is_new,
        description: r.description || undefined,
        fullLength: r.full_length || undefined,
        barrelLength: r.barrel_length || undefined,
        thickness: r.thickness || undefined,
    };
}

export async function getAllProducts(): Promise<Product[]> {
    if (!isDbConfigured()) return fileProducts;
    try {
        const rows = (await getSql()`
            SELECT id, name, price, image_url, steel, hardness, handle, category,
                   is_new, description, full_length, barrel_length, thickness
            FROM products
            WHERE active = true
            ORDER BY sort_order ASC
        `) as ProductRow[];
        if (!rows || rows.length === 0) return fileProducts;
        return rows.map(rowToProduct);
    } catch (e) {
        console.error("getAllProducts DB hatası, dosyaya düşülüyor:", e);
        return fileProducts;
    }
}

// Admin için: pasif ürünler dahil tümünü döner (yalnızca DB varsa)
export async function getAllProductsAdmin(): Promise<(Product & { active: boolean })[]> {
    if (!isDbConfigured()) return fileProducts.map((p) => ({ ...p, active: true }));
    const rows = (await getSql()`
        SELECT id, name, price, image_url, steel, hardness, handle, category,
               is_new, description, full_length, barrel_length, thickness, active
        FROM products ORDER BY sort_order ASC
    `) as (ProductRow & { active: boolean })[];
    return rows.map((r) => ({ ...rowToProduct(r), active: r.active }));
}

export async function getProductById(id: string): Promise<Product | null> {
    if (!isDbConfigured()) return fileProducts.find((p) => p.id === id) || null;
    try {
        const rows = (await getSql()`
            SELECT id, name, price, image_url, steel, hardness, handle, category,
                   is_new, description, full_length, barrel_length, thickness
            FROM products WHERE id = ${id} AND active = true LIMIT 1
        `) as ProductRow[];
        if (rows && rows.length > 0) return rowToProduct(rows[0]);
        return fileProducts.find((p) => p.id === id) || null;
    } catch (e) {
        console.error("getProductById DB hatası, dosyaya düşülüyor:", e);
        return fileProducts.find((p) => p.id === id) || null;
    }
}
