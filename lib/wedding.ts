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
    ceremonyTime: "14:10",
    receptionTime: "14:55",

    // ── 会場 ──────────────────────────────────
    venueName: "ザ ストリングス 表参道",
    venuePostalCode: "〒107-0061",
    venueAddress: "東京都港区北青山３丁目６−８ ザストリングス表参道",
    venuePhone: "0357784585",
    venueMapsUrl: "https://maps.app.goo.gl/TEKiVQ3ncpDRAhxN6",

    // ── タイムテーブル ────────────────────────
    timetable: [
        { time: "13:25", label: "受付開始" },
        { time: "14:10", label: "挙式" },
        { time: "14:55", label: "披露宴" },
        { time: "17:25", label: "お開き" },
    ],

    // ── RSVP ──────────────────────────────────
    rsvpDeadline: "2026年4月19日(日)",
} as const;
