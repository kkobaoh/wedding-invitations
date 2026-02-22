import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("images") as File[];

        if (files.length === 0) {
            return NextResponse.json(
                { error: "画像が選択されていません" },
                { status: 400 }
            );
        }

        if (files.length > MAX_FILES) {
            return NextResponse.json(
                { error: `画像は最大 ${MAX_FILES} 枚までアップロードできます` },
                { status: 400 }
            );
        }

        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { error: "JPEG・PNG・WebP・GIF 形式の画像のみアップロードできます" },
                    { status: 400 }
                );
            }
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: "1 枚あたりの画像サイズは 5 MB 以内にしてください" },
                    { status: 400 }
                );
            }
        }

        const urls: string[] = [];
        for (const file of files) {
            const blob = await put(`rsvp/${Date.now()}-${file.name}`, file, {
                access: "public",
            });
            urls.push(blob.url);
        }

        return NextResponse.json({ urls });
    } catch (error) {
        console.error("Image upload error:", error);
        return NextResponse.json(
            { error: "画像のアップロードに失敗しました。時間をおいて再度お試しください。" },
            { status: 500 }
        );
    }
}
