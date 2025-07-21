import { NextResponse } from "next/server";

export function middleware(req) {
    const { pathname } = req.nextUrl;
    const accessToken = req.cookies.get("access-token")?.value;

    const protectedRoutes = ["/view", "/manager"];
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

    if (!accessToken && isProtected) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next(); // Tiếp tục nếu đã đăng nhập
}

export const config = {
    matcher: ["/view/:path*", "/manager/:path*"], // Khớp tất cả các đường dẫn con
};