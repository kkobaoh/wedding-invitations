import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// 本番環境用 drizzle-kit 設定
// .env.production.local から DATABASE_URL を読み込む
// 使用方法: npm run db:push:prod
config({ path: ".env.production.local" });

export default defineConfig({
    schema: "./lib/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
