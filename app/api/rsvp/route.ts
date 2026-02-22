import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rsvpResponses, rsvpInsertSchema } from "@/lib/schema";

export async function POST(request: Request) {
    try {
        // rsvpInsertSchema で解析・バリデーションを一括実行
        // request.json() は any を返すが、safeParse が型安全な data を保証する
        const parsed = rsvpInsertSchema.safeParse(await request.json());

        if (!parsed.success) {
            const message =
                parsed.error.issues[0]?.message ?? "入力内容に誤りがあります";
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const data = parsed.data;

        await db.insert(rsvpResponses).values({
            name: data.name,
            furigana: data.furigana ?? null,
            attendance: data.attendance,
            // 欠席の場合は guestCount を保存しない
            guestCount:
                data.attendance === "attend" ? (data.guestCount ?? 1) : null,
            dietaryRestrictions: data.dietaryRestrictions ?? null,
            postalCode: data.postalCode ?? null,
            address: data.address ?? null,
            message: data.message ?? null,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("RSVP submission error:", error);
        return NextResponse.json(
            { error: "送信に失敗しました。時間をおいて再度お試しください。" },
            { status: 500 }
        );
    }
}
