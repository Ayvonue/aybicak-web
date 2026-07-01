import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/adminSession";

// Admin API rotalarında oturum kontrolü. Yetki yoksa null döner.
export async function requireAdmin(): Promise<string | null> {
    const store = await cookies();
    const token = store.get(ADMIN_COOKIE)?.value;
    return verifyAdminToken(token);
}
