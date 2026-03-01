import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invitations, guests, rsvpImages, rsvpFormSchema } from "@/lib/schema";

export async function POST(request: Request) {
    try {
        const parsed = rsvpFormSchema.safeParse(await request.json());

        if (!parsed.success) {
            const message =
                parsed.error.issues[0]?.message ?? "入力内容に誤りがあります";
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const data = parsed.data;

        // 1. invitation を先に挿入（representative_id は後で更新）
        const invitationRows = await db
            .insert(invitations)
            .values({
                representativeId: null,
                postalCode: data.postalCode ?? null,
                address: data.address ?? null,
                message: data.message ?? null,
            })
            .returning({ id: invitations.id });

        const invitationId = invitationRows[0]!.id;

        // 2. 代表者ゲストを挿入
        const representativeRows = await db
            .insert(guests)
            .values({
                name: data.name,
                furigana: data.furigana ?? null,
                guestSide: data.guestSide ?? null,
                hairSet: data.hairSet ?? null,
                makeup: data.makeup ?? null,
                allergy: data.allergy ?? null,
                invitationId,
            })
            .returning({ id: guests.id });

        // 3. 同行者ゲストを挿入
        if (data.guests && data.guests.length > 0) {
            await db.insert(guests).values(
                data.guests.map((g) => ({
                    name: g.name,
                    furigana: g.furigana ?? null,
                    guestSide: data.guestSide ?? null,
                    hairSet: null,
                    makeup: null,
                    allergy: null,
                    invitationId,
                }))
            );
        }

        // 4. invitation.representative_id を代表者の ID で更新
        await db
            .update(invitations)
            .set({ representativeId: representativeRows[0]!.id })
            .where(eq(invitations.id, invitationId));

        // 5. 画像レコードを挿入
        const imageUrls = data.imageUrls ?? [];
        if (imageUrls.length > 0) {
            await db.insert(rsvpImages).values(
                imageUrls.map((url, index) => ({
                    invitationId,
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
