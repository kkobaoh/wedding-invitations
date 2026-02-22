import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name,
            furigana,
            attendance,
            guestCount,
            dietaryRestrictions,
            postalCode,
            address,
            message,
        } = body;

        // サーバーサイドバリデーション
        if (!name?.trim()) {
            return NextResponse.json(
                { error: "お名前は必須です" },
                { status: 400 }
            );
        }
        if (attendance !== "attend" && attendance !== "absent") {
            return NextResponse.json(
                { error: "ご出欠の値が不正です" },
                { status: 400 }
            );
        }

        const guestCountValue =
            attendance === "attend" ? (parseInt(guestCount) || 1) : null;

        await sql`
            INSERT INTO rsvp_responses (
                name,
                furigana,
                attendance,
                guest_count,
                dietary_restrictions,
                postal_code,
                address,
                message
            ) VALUES (
                ${name.trim()},
                ${furigana?.trim() || null},
                ${attendance},
                ${guestCountValue},
                ${dietaryRestrictions?.trim() || null},
                ${postalCode?.trim() || null},
                ${address?.trim() || null},
                ${message?.trim() || null}
            )
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("RSVP submission error:", error);
        return NextResponse.json(
            { error: "送信に失敗しました。時間をおいて再度お試しください。" },
            { status: 500 }
        );
    }
}
