import {
    pgTable,
    serial,
    integer,
    varchar,
    smallint,
    text,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { z } from "zod";

// ── PostgreSQL ENUM 型 ──────────────────────────────────────
export const guestSideEnum = pgEnum("guest_side_enum", ["groom", "bride"]);
export const hairSetEnum = pgEnum("hair_set_enum", [
    "short",
    "upstyle",
    "mens",
    "children",
]);
export const makeupEnum = pgEnum("makeup_enum", ["full", "base"]);
export const afterPartyEnum = pgEnum("after_party_enum", [
    "attend",
    "absent",
    "undecided",
]);
export const attendanceEnum = pgEnum("attendance_enum", ["attend", "absent"]);

// ── テーブル定義 ────────────────────────────────────────────
/**
 * invitations: 招待状 1件 = 1申込（representative_id は挿入後に更新）
 */
export const invitations = pgTable("invitations", {
    id: serial("id").primaryKey(),
    /** 代表者ゲストの ID（guests.id への FK） */
    representativeId: integer("representative_id"),
    postalCode: varchar("postal_code", { length: 20 }),
    address: text("address"),
    message: text("message"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

/**
 * guests: 招待状に紐づくゲスト（代表者 + 同行者）
 */
export const guests = pgTable("guests", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    furigana: varchar("furigana", { length: 100 }),
    guestSide: guestSideEnum("guest_side"),
    hairSet: hairSetEnum("hair_set"),
    makeup: makeupEnum("makeup"),
    allergy: text("allergy"),
    afterParty: afterPartyEnum("after_party"),
    attendance: attendanceEnum("attendance"),
    /** 所属する招待状 ID（invitations.id への FK） */
    invitationId: integer("invitation_id").notNull(),
});

export const rsvpImages = pgTable("rsvp_images", {
    id: serial("id").primaryKey(),
    invitationId: integer("invitation_id").notNull(),
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
    attendance: z.enum(["attend", "absent"] as const),
    guestSide: z.enum(guestSideEnum.enumValues).optional(),
    /** 同行者リスト（申込本人を除く、最大 4 名） */
    guests: z
        .array(
            z.object({
                name: z.string().trim().min(1, "同行者のお名前を入力してください"),
                furigana: z.string().trim().optional(),
                hairSet: z.enum(hairSetEnum.enumValues).optional(),
                makeup: z.enum(makeupEnum.enumValues).optional(),
                allergy: z.string().trim().optional(),
                afterParty: z.enum(afterPartyEnum.enumValues).optional(),
            })
        )
        .max(4)
        .optional()
        .default([]),
    /** ヘアセット種別（代表者のみ） */
    hairSet: z.enum(hairSetEnum.enumValues).optional(),
    /** メイク種別（代表者のみ） */
    makeup: z.enum(makeupEnum.enumValues).optional(),
    allergy: z.string().trim().optional(),
    afterParty: z.enum(afterPartyEnum.enumValues).optional(),
    postalCode: z.string().trim().optional(),
    address: z.string().trim().optional(),
    message: z.string().trim().optional(),
    /** アップロード済み画像 URL（最大 5 枚） */
    imageUrls: z.array(z.string()).max(5).optional().default([]),
});

// ── 型エクスポート ──────────────────────────────────────────
export type RsvpFormInput = z.infer<typeof rsvpFormSchema>;
export type NewInvitation = typeof invitations.$inferInsert;
export type NewGuest = typeof guests.$inferInsert;
export type NewRsvpImage = typeof rsvpImages.$inferInsert;
