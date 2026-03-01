import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (_pathname) => {
                return {
                    access: "public",
                    contentTypes: ALLOWED_TYPES,
                    maximumSizeInBytes: MAX_FILE_SIZE,
                    addRandomSuffix: false,
                };
            },
            onUploadCompleted: async ({ blob }) => {
                console.log("Image upload completed:", blob.url);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.error("Image upload error:", error);
        return NextResponse.json(
            { error: "画像のアップロードに失敗しました。時間をおいて再度お試しください。" },
            { status: 500 }
        );
    }
}
