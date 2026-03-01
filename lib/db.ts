import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL 環境変数が設定されていません");
}

// postgres.js はローカル Docker と Neon の両方に対応
// Neon 接続時は接続文字列に ?sslmode=require が必要
const client = postgres(process.env.DATABASE_URL);

export const db = drizzle(client, { schema });
