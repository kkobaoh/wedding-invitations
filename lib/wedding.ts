/** 招待状全体で共有する式典情報。変更はここだけ行う。 */
export const WEDDING = {
    // ── カップル ──────────────────────────────
    groomJa: "小橋 一樹",
    groomEn: "Kazuki",
    brideJa: "御﨑 日菜",
    brideEn: "Hina",

    // ── 日付 ──────────────────────────────────
    /** 本文用: 2026年6月6日（土） */
    dateJa: "2026年6月6日 (土)",
    /** ヒーロー表示用: 2026 . 6 . 6 SAT */
    dateEn: "2026 . 6 . 6 SAT",
    /** フッター表示用: 2026.6.6 */
    dateFooter: "2026.6.6",

    // ── 時刻 ──────────────────────────────────
    ceremonyTime: "12:00",
    receptionTime: "13:30",

    // ── 会場 ──────────────────────────────────
    venueName: "〇〇グランドホテル",
    venuePostalCode: "〒100-0000",
    venueAddress: "東京都千代田区〇〇1-2-3",
    venuePhone: "03-XXXX-XXXX",
    venueMapsUrl: "https://maps.google.com",

    // ── RSVP ──────────────────────────────────
    rsvpDeadline: "2026年4月19日(日)",
} as const;
