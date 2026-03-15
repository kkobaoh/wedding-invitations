export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { invitations, guests, rsvpImages } from "@/lib/schema";
import { desc, asc } from "drizzle-orm";
import LogoutButton from "./_components/LogoutButton";

const GUEST_SIDE_LABEL = { groom: "新郎側", bride: "新婦側" } as const;
const HAIR_SET_LABEL = {
    short: "ショート",
    upstyle: "アップスタイル",
    mens: "メンズ",
    children: "こども",
} as const;
const MAKEUP_LABEL = { full: "フルメイク", base: "ベースメイク" } as const;
const AFTER_PARTY_LABEL = { attend: "参加", absent: "不参加", undecided: "未定" } as const;
const ATTENDANCE_LABEL = { attend: "出席", absent: "欠席" } as const;

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export default async function AdminPage() {
    const [allInvitations, allGuests, allImages] = await Promise.all([
        db.select().from(invitations).orderBy(desc(invitations.submittedAt)),
        db.select().from(guests),
        db.select().from(rsvpImages).orderBy(asc(rsvpImages.sortOrder)),
    ]);

    const entries = allInvitations.map((inv) => {
        const invGuests = allGuests.filter((g) => g.invitationId === inv.id);
        const representative = invGuests.find((g) => g.id === inv.representativeId);
        const companions = invGuests.filter((g) => g.id !== inv.representativeId);
        const images = allImages.filter((img) => img.invitationId === inv.id);
        return { ...inv, representative, companions, images };
    });

    const attendingGuests = allGuests.filter((g) => g.attendance === "attend").length;
    const absentGuests = allGuests.filter((g) => g.attendance === "absent").length;
    const afterPartyAttend = allGuests.filter((g) => g.afterParty === "attend").length;

    return (
        <div className="min-h-screen bg-stone-100">
            {/* ヘッダー */}
            <header className="sticky top-0 z-10 bg-white border-b border-stone-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold text-stone-800">
                            管理画面
                        </h1>
                        <div className="flex gap-3 text-sm text-stone-500">
                            <span>
                                申込:{" "}
                                <strong className="text-stone-700">
                                    {allInvitations.length}
                                </strong>{" "}
                                件
                            </span>
                            <span>
                                出席:{" "}
                                <strong className="text-stone-700">
                                    {attendingGuests}
                                </strong>{" "}
                                名
                            </span>
                            <span>
                                欠席:{" "}
                                <strong className="text-stone-700">
                                    {absentGuests}
                                </strong>{" "}
                                名
                            </span>
                            <span>
                                二次会参加:{" "}
                                <strong className="text-stone-700">
                                    {afterPartyAttend}
                                </strong>{" "}
                                名
                            </span>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </header>

            {/* コンテンツ */}
            <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                {entries.length === 0 && (
                    <div className="text-center py-20 text-stone-400">
                        まだ申込はありません
                    </div>
                )}

                {entries.map((entry, index) => (
                    <div
                        key={entry.id}
                        className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
                    >
                        {/* カードヘッダー */}
                        <div className="flex items-center justify-between px-5 py-3 bg-stone-50 border-b border-stone-200">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-white bg-sage-400 rounded-full w-6 h-6 flex items-center justify-center">
                                    {allInvitations.length - index}
                                </span>
                                <span className="font-semibold text-stone-800">
                                    {entry.representative?.name ?? "（名前なし）"}
                                </span>
                                {entry.representative?.furigana && (
                                    <span className="text-stone-500 text-sm">
                                        {entry.representative.furigana}
                                    </span>
                                )}
                                {entry.representative?.guestSide && (
                                    <span className="text-xs bg-sage-50 text-sage-600 border border-sage-200 rounded-full px-2 py-0.5">
                                        {GUEST_SIDE_LABEL[entry.representative.guestSide]}
                                    </span>
                                )}
                                {entry.representative?.attendance && (
                                    <span className={`text-xs rounded-full px-2 py-0.5 border ${entry.representative.attendance === "attend" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                                        {ATTENDANCE_LABEL[entry.representative.attendance]}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-stone-400">
                                {formatDate(entry.submittedAt)}
                            </span>
                        </div>

                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 左カラム: ゲスト情報 */}
                            <div className="space-y-4">
                                {/* 代表者詳細 */}
                                <section>
                                    <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                                        代表者
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        {entry.representative?.hairSet && (
                                            <Row
                                                label="ヘアセット"
                                                value={
                                                    HAIR_SET_LABEL[
                                                        entry.representative.hairSet
                                                    ]
                                                }
                                            />
                                        )}
                                        {entry.representative?.makeup && (
                                            <Row
                                                label="メイク"
                                                value={
                                                    MAKEUP_LABEL[
                                                        entry.representative.makeup
                                                    ]
                                                }
                                            />
                                        )}
                                        {entry.representative?.allergy && (
                                            <Row
                                                label="アレルギー"
                                                value={entry.representative.allergy}
                                            />
                                        )}
                                        {entry.representative?.afterParty && (
                                            <Row
                                                label="二次会"
                                                value={
                                                    AFTER_PARTY_LABEL[
                                                        entry.representative.afterParty
                                                    ]
                                                }
                                            />
                                        )}
                                        {!entry.representative?.hairSet &&
                                            !entry.representative?.makeup &&
                                            !entry.representative?.allergy &&
                                            !entry.representative?.afterParty && (
                                                <p className="text-stone-400 text-xs">
                                                    オプションなし
                                                </p>
                                            )}
                                    </div>
                                </section>

                                {/* 同行者 */}
                                {entry.companions.length > 0 && (
                                    <section>
                                        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                                            同行者 ({entry.companions.length}名)
                                        </h3>
                                        <ul className="space-y-1">
                                            {entry.companions.map((c) => (
                                                <li
                                                    key={c.id}
                                                    className="text-sm text-stone-700 flex gap-2 items-center"
                                                >
                                                    <span>{c.name}</span>
                                                    {c.furigana && (
                                                        <span className="text-stone-400">
                                                            {c.furigana}
                                                        </span>
                                                    )}
                                                    {c.afterParty && (
                                                        <span className="text-xs bg-stone-100 text-stone-500 rounded-full px-2 py-0.5">
                                                            二次会: {AFTER_PARTY_LABEL[c.afterParty]}
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                {/* 住所 */}
                                {(entry.postalCode || entry.address) && (
                                    <section>
                                        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                                            住所
                                        </h3>
                                        <div className="space-y-1 text-sm">
                                            {entry.postalCode && (
                                                <Row
                                                    label="〒"
                                                    value={entry.postalCode}
                                                />
                                            )}
                                            {entry.address && (
                                                <Row
                                                    label="住所"
                                                    value={entry.address}
                                                />
                                            )}
                                        </div>
                                    </section>
                                )}

                                {/* メッセージ */}
                                {entry.message && (
                                    <section>
                                        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                                            メッセージ
                                        </h3>
                                        <p className="text-sm text-stone-700 bg-stone-50 rounded-lg px-3 py-2 whitespace-pre-wrap">
                                            {entry.message}
                                        </p>
                                    </section>
                                )}
                            </div>

                            {/* 右カラム: 画像 */}
                            <div>
                                {entry.images.length > 0 ? (
                                    <section>
                                        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                                            画像 ({entry.images.length}枚)
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {entry.images.map((img) => (
                                                <a
                                                    key={img.id}
                                                    href={img.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block rounded-lg overflow-hidden border border-stone-200 hover:border-sage-300 transition aspect-square"
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={img.url}
                                                        alt={`画像 ${img.sortOrder + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    </section>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-stone-300 text-sm border-2 border-dashed border-stone-200 rounded-xl">
                                        画像なし
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-2">
            <span className="text-stone-400 shrink-0 w-20">{label}</span>
            <span className="text-stone-700">{value}</span>
        </div>
    );
}
