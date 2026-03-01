import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Docker ローカル環境用 drizzle-kit 設定
// .env.docker から DATABASE_URL を読み込む
// 使用方法: npm run db:push:docker
config({ path: ".env.docker" });

export default defineConfig({
    schema: "./lib/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
