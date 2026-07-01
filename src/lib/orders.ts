import { getSql, isDbConfigured } from "@/lib/db";

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    city: string;
    items: OrderItem[];
    total: number;
    paymentMethod: string;
    status: string;
    notes: string | null;
    createdAt: string;
}

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

// Siparişi kalıcı olarak kaydeder. DB yoksa sessizce false döner (akış bozulmaz).
export async function createOrder(order: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    city: string;
    items: OrderItem[];
    total: number;
    paymentMethod: string;
    status?: string;
    notes?: string;
}): Promise<boolean> {
    if (!isDbConfigured()) return false;
    try {
        await getSql()`
            INSERT INTO orders (id, customer_name, customer_email, customer_phone, address, city, items, total, payment_method, status, notes)
            VALUES (${order.id}, ${order.customerName}, ${order.customerEmail}, ${order.customerPhone},
                    ${order.address}, ${order.city}, ${JSON.stringify(order.items)}, ${order.total},
                    ${order.paymentMethod}, ${order.status || "pending"}, ${order.notes || null})
        `;
        return true;
    } catch (e) {
        console.error("createOrder hatası:", e);
        return false;
    }
}

interface OrderRow {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    address: string;
    city: string;
    items: OrderItem[];
    total: string | number;
    payment_method: string;
    status: string;
    notes: string | null;
    created_at: string;
}

function rowToOrder(r: OrderRow): Order {
    return {
        id: r.id,
        customerName: r.customer_name,
        customerEmail: r.customer_email,
        customerPhone: r.customer_phone,
        address: r.address,
        city: r.city,
        items: typeof r.items === "string" ? JSON.parse(r.items) : r.items,
        total: Number(r.total),
        paymentMethod: r.payment_method,
        status: r.status,
        notes: r.notes,
        createdAt: r.created_at,
    };
}

export async function listOrders(limit = 100): Promise<Order[]> {
    if (!isDbConfigured()) return [];
    const rows = (await getSql()`
        SELECT * FROM orders ORDER BY created_at DESC LIMIT ${limit}
    `) as OrderRow[];
    return rows.map(rowToOrder);
}

export async function updateOrderStatus(id: string, status: string): Promise<boolean> {
    if (!isDbConfigured()) return false;
    if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) return false;
    try {
        await getSql()`UPDATE orders SET status = ${status} WHERE id = ${id}`;
        return true;
    } catch (e) {
        console.error("updateOrderStatus hatası:", e);
        return false;
    }
}
