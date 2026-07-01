import { listOrders } from "@/lib/orders";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
    const orders = await listOrders(200);
    return <OrdersClient orders={orders} />;
}
