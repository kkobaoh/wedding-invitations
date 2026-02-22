import {
    pgTable,
    serial,
    varchar,
    smallint,
    text,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── PostgreSQL ENUM 型 ──────────────────────────────────────
// .$type<>() による TypeScript のみの型上書きではなく、
// DB レベルで "attend" | "absent" のみを許可する ENUM 型として定義する
export const attendanceEnum = pgEnum("attendance_enum", ["attend", "absent"]);

// ── テーブル定義 ────────────────────────────────────────────
export const rsvpResponses = pgTable("rsvp_responses", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    furigana: varchar("furigana", { length: 100 }),
    attendance: attendanceEnum("attendance").notNull(),
    guestCount: smallint("guest_count"),
    dietaryRestrictions: text("dietary_restrictions"),
    postalCode: varchar("postal_code", { length: 20 }),
    address: text("address"),
    message: text("message"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

// ── バリデーションスキーマ ──────────────────────────────────
// createInsertSchema が Drizzle テーブル定義から Zod スキーマを自動生成する。
// スキーマと型定義が一元管理されるため、テーブル変更時の更新漏れを防ぐ。
export const rsvpInsertSchema = createInsertSchema(rsvpResponses, {
    // name: DB は varchar(100) だが、空文字を明示的に禁止する
    name: (schema) => schema.trim().min(1, "お名前は必須です"),
    // guestCount: フォームは文字列で送信するため coerce で数値に変換する
    guestCount: z.coerce.number().int().min(1).max(5).nullable().optional(),
}).omit({
    // id / submittedAt は DB が自動設定するため、挿入時は不要
    id: true,
    submittedAt: true,
});

// ── 型エクスポート ──────────────────────────────────────────
/** API リクエストの入力型（Zod スキーマから自動導出） */
export type RsvpInsert = z.infer<typeof rsvpInsertSchema>;

/** Drizzle insert の型（DB 側の型） */
export type NewRsvpResponse = typeof rsvpResponses.$inferInsert;
