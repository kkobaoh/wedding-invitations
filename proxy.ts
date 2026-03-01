import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith("/admin") &&
        !pathname.startsWith("/admin/login")
    ) {
        const token = request.cookies.get("admin-token")?.value;
        const adminSecret = process.env.ADMIN_SECRET;

        if (!adminSecret || !token || token !== adminSecret) {
            return NextResponse.redirect(
                new URL("/admin/login", request.url)
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
