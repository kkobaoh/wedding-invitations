import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const { password } = await request.json();

    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json(
            { error: "パスワードが正しくありません" },
            { status: 401 }
        );
    }

    if (!process.env.ADMIN_SECRET) {
        return NextResponse.json(
            { error: "サーバー設定エラー (ADMIN_SECRET が未設定)" },
            { status: 500 }
        );
    }

    const cookieStore = await cookies();
    cookieStore.set("admin-token", process.env.ADMIN_SECRET, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7日間
        path: "/",
    });

    return NextResponse.json({ success: true });
}
