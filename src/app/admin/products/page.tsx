import { getAllProductsAdmin } from "@/lib/products-source";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
    const products = await getAllProductsAdmin();
    return <ProductsClient products={products} />;
}
