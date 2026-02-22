import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL 環境変数が設定されていません");
}

export const sql = neon(process.env.DATABASE_URL);
