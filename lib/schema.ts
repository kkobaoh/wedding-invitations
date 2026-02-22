import {
    pgTable,
    serial,
    uuid,
    varchar,
    boolean,
    smallint,
    text,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { z } from "zod";

// ── PostgreSQL ENUM 型 ──────────────────────────────────────
export const attendanceEnum = pgEnum("attendance_enum", ["attend", "absent"]);
export const guestSideEnum = pgEnum("guest_side_enum", ["groom", "bride"]);
export const hairSetEnum = pgEnum("hair_set_enum", [
    "short",
    "upstyle",
    "mens",
    "children",
]);
export const makeupEnum = pgEnum("makeup_enum", ["full", "base"]);

// ── テーブル定義 ────────────────────────────────────────────
export const rsvpResponses = pgTable("rsvp_responses", {
    id: serial("id").primaryKey(),
    /** グループ ID: 同一申込の登録者 + 同行者をまとめる UUID */
    groupId: uuid("group_id").notNull(),
    /** true = 申込本人 / false = 同行者 */
    isPrimary: boolean("is_primary").notNull().default(false),
    name: varchar("name", { length: 100 }).notNull(),
    furigana: varchar("furigana", { length: 100 }),
    attendance: attendanceEnum("attendance").notNull(),
    /** 新郎側 / 新婦側 */
    guestSide: guestSideEnum("guest_side"),
    /** ヘアセットの種別（申込本人のみ設定） */
    hairSet: hairSetEnum("hair_set"),
    /** メイクの種別（申込本人のみ設定） */
    makeup: makeupEnum("makeup"),
    dietaryRestrictions: text("dietary_restrictions"),
    postalCode: varchar("postal_code", { length: 20 }),
    address: text("address"),
    message: text("message"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export const rsvpImages = pgTable("rsvp_images", {
    id: serial("id").primaryKey(),
    groupId: uuid("group_id").notNull(),
    url: text("url").notNull(),
    sortOrder: smallint("sort_order").notNull().default(0),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

// ── フォームバリデーションスキーマ ──────────────────────────
export const rsvpFormSchema = z.object({
    name: z.string().trim().min(1, "お名前は必須です"),
    furigana: z.string().trim().optional(),
    attendance: z.enum(attendanceEnum.enumValues),
    guestSide: z.enum(guestSideEnum.enumValues).optional(),
    /** 同行者リスト（申込本人を除く、最大 4 名） */
    guests: z
        .array(
            z.object({
                name: z.string().trim().min(1, "同行者のお名前を入力してください"),
                furigana: z.string().trim().optional(),
            })
        )
        .max(4)
        .optional()
        .default([]),
    /** ヘアセット種別（出席者のみ） */
    hairSet: z.enum(hairSetEnum.enumValues).optional(),
    /** メイク種別（出席者のみ） */
    makeup: z.enum(makeupEnum.enumValues).optional(),
    dietaryRestrictions: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    address: z.string().trim().optional(),
    message: z.string().trim().optional(),
    /** アップロード済み画像 URL（最大 5 枚） */
    imageUrls: z.array(z.string()).max(5).optional().default([]),
});

// ── 型エクスポート ──────────────────────────────────────────
export type RsvpFormInput = z.infer<typeof rsvpFormSchema>;
export type NewRsvpResponse = typeof rsvpResponses.$inferInsert;
export type NewRsvpImage = typeof rsvpImages.$inferInsert;
