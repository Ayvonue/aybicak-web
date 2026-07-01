import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/adminSession";

// /admin/* rotalarını korur; geçerli oturum yoksa /admin/login'e yönlendirir.
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Giriş sayfası ve giriş API'si serbest
    if (pathname === "/admin/login") {
        return NextResponse.next();
    }

    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const email = await verifyAdminToken(token);

    if (!email) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        url.searchParams.set("from", pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
