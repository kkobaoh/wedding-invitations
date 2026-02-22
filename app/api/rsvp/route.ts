import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rsvpResponses, rsvpImages, rsvpFormSchema } from "@/lib/schema";

export async function POST(request: Request) {
    try {
        const parsed = rsvpFormSchema.safeParse(await request.json());

        if (!parsed.success) {
            const message =
                parsed.error.issues[0]?.message ?? "入力内容に誤りがあります";
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const data = parsed.data;
        const groupId = crypto.randomUUID();

        // 申込本人を挿入
        const records = [
            {
                groupId,
                isPrimary: true,
                name: data.name,
                furigana: data.furigana ?? null,
                attendance: data.attendance,
                guestSide: data.guestSide ?? null,
                hairSet: data.hairSet ?? null,
                makeup: data.makeup ?? null,
                dietaryRestrictions: data.dietaryRestrictions ?? null,
                postalCode: data.postalCode ?? null,
                address: data.address ?? null,
                message: data.message ?? null,
            },
        ];

        // 同行者を挿入（住所は申込本人のデータを流用、ヘアセット/メイク/メッセージは null）
        for (const guest of data.guests ?? []) {
            records.push({
                groupId,
                isPrimary: false,
                name: guest.name,
                furigana: guest.furigana ?? null,
                attendance: data.attendance,
                guestSide: data.guestSide ?? null,
                hairSet: null,
                makeup: null,
                dietaryRestrictions: null,
                postalCode: data.postalCode ?? null,
                address: data.address ?? null,
                message: null,
            });
        }

        await db.insert(rsvpResponses).values(records);

        // 画像レコードを挿入
        const imageUrls = data.imageUrls ?? [];
        if (imageUrls.length > 0) {
            await db.insert(rsvpImages).values(
                imageUrls.map((url, index) => ({
                    groupId,
                    url,
                    sortOrder: index,
                }))
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("RSVP submission error:", error);
        return NextResponse.json(
            { error: "送信に失敗しました。時間をおいて再度お試しください。" },
            { status: 500 }
        );
    }
}
