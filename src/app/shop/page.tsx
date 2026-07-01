import { getAllProducts } from "@/lib/products-source";
import ShopClient from "./ShopClient";

export const revalidate = 300;

export default async function ShopPage() {
    const products = await getAllProducts();
    return <ShopClient products={products} />;
}
