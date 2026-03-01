import Link from "next/link";
import { WEDDING } from "@/lib/wedding";
import PhotoCarousel from "@/app/components/PhotoCarousel";

export default function Home() {
    return (
        <main className="min-h-screen">
            {/* ── Hero Section ───────────────────────────────── */}
            <section className="flex flex-col items-center justify-center min-h-screen text-center px-6 py-20 relative bg-stone-50">
                {/* Wedding Invitation ラベル */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-px w-16 bg-rose-200" />
                    <span className="text-rose-300 text-xs tracking-[0.3em] uppercase">
                        Wedding Invitation
                    </span>
                    <div className="h-px w-16 bg-rose-200" />
                </div>

                {/* カップル名 */}
                <p className="text-gray-400 text-sm tracking-widest mb-3">
                    {WEDDING.groomJa}
                </p>
                <div
                    className="text-6xl md:text-8xl font-light text-gray-700 mb-1"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                    {WEDDING.groomEn}
                </div>
                <div
                    className="text-3xl text-rose-300 my-2"
                    style={{ fontFamily: "Georgia, serif" }}
                >
                    &amp;
                </div>
                <div
                    className="text-6xl md:text-8xl font-light text-gray-700 mb-3"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                    {WEDDING.brideEn}
                </div>
                <p className="text-gray-400 text-sm tracking-widest mb-10">
                    {WEDDING.brideJa}
                </p>

                {/* 日付 */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-px w-12 bg-gray-300" />
                    <p className="text-gray-500 tracking-widest text-sm">
                        {WEDDING.dateEn}
                    </p>
                    <div className="h-px w-12 bg-gray-300" />
                </div>

                {/* 写真 */}
                <div className="w-full mb-12">
                    <PhotoCarousel />
                </div>

                {/* 招待メッセージ */}
                <div className="max-w-sm mb-12 text-gray-500 leading-loose text-sm space-y-1">
                    <p>謹んでご案内申し上げます</p>
                    <p>このたび 私どもは 結婚式を挙げることになりました</p>
                    <p>ご多用中 誠に恐縮ではございますが</p>
                    <p>ぜひともご臨席賜りたく ご案内申し上げます</p>
                </div>

                {/* RSVP ボタン */}
                <Link
                    href="/rsvp"
                    className="inline-block bg-rose-400 text-white px-10 py-4 text-sm tracking-widest hover:bg-rose-500 transition-colors"
                >
                    出欠を回答する
                </Link>
                <p className="mt-4 text-gray-400 text-xs">
                    {WEDDING.rsvpDeadline}までにご回答ください
                </p>

                {/* スクロールヒント */}
                <div className="absolute bottom-8 flex flex-col items-center text-gray-300">
                    <span className="text-xs tracking-widest">SCROLL</span>
                    <div className="w-px h-8 bg-gray-300" />
                </div>
            </section>

            {/* ── 式の詳細 Section ────────────────────────────── */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-lg mx-auto">
                    {/* セクションヘッダー */}
                    <div className="flex items-center gap-4 justify-center mb-14">
                        <div className="h-px w-12 bg-rose-200" />
                        <span className="text-rose-300 text-xs tracking-[0.3em] uppercase">
                            Details
                        </span>
                        <div className="h-px w-12 bg-rose-200" />
                    </div>

                    <div className="space-y-12">
                        {/* 挙式 */}
                        <div className="text-center">
                            <h2 className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-4">
                                Ceremony
                            </h2>
                            <p className="text-gray-700 text-lg mb-1">
                                {WEDDING.dateJa}
                            </p>
                            <p className="text-gray-500 text-sm">
                                挙式 {WEDDING.ceremonyTime} 〜
                            </p>
                        </div>

                        <div className="h-px bg-gray-100" />

                        {/* 披露宴 */}
                        <div className="text-center">
                            <h2 className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-4">
                                Reception
                            </h2>
                            <p className="text-gray-700 text-lg mb-1">
                                {WEDDING.dateJa}
                            </p>
                            <p className="text-gray-500 text-sm">
                                披露宴 {WEDDING.receptionTime} 〜
                            </p>
                        </div>

                        <div className="h-px bg-gray-100" />

                        {/* 会場 */}
                        <div className="text-center">
                            <h2 className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-4">
                                Venue
                            </h2>
                            <p className="text-gray-700 text-lg mb-3">
                                {WEDDING.venueName}
                            </p>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {WEDDING.venuePostalCode}
                                <br />
                                {WEDDING.venueAddress}
                                <br />
                                Tel: {WEDDING.venuePhone}
                            </p>
                            <a
                                href={WEDDING.venueMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-4 text-rose-400 text-xs border-b border-rose-300 pb-0.5 hover:text-rose-500 transition-colors"
                            >
                                Google Maps で開く
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Timetable Section ───────────────────────────── */}
            <section className="py-24 px-6 bg-stone-50">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center gap-4 justify-center mb-14">
                        <div className="h-px w-12 bg-rose-200" />
                        <span className="text-rose-300 text-xs tracking-[0.3em] uppercase">
                            Timetable
                        </span>
                        <div className="h-px w-12 bg-rose-200" />
                    </div>

                    <div className="relative">
                        {/* 縦線 */}
                        <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-rose-100" />

                        <div className="space-y-8">
                            {WEDDING.timetable.map((item, i) => (
                                <div key={i} className="relative flex items-center">
                                    {/* 時刻（左） */}
                                    <div className="w-1/2 text-right pr-8">
                                        <span className="text-gray-500 text-sm tracking-widest">
                                            {item.time}
                                        </span>
                                    </div>

                                    {/* 点（中央） */}
                                    <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-rose-300 bg-stone-50 z-10" />

                                    {/* ラベル（右） */}
                                    <div className="w-1/2 pl-8">
                                        <span className="text-gray-700 text-sm">
                                            {item.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── RSVP CTA Section ────────────────────────────── */}
            <section className="py-24 px-6 text-center bg-stone-50">
                <div className="flex items-center gap-4 justify-center mb-6">
                    <div className="h-px w-12 bg-rose-200" />
                    <span className="text-rose-300 text-xs tracking-[0.3em] uppercase">
                        RSVP
                    </span>
                    <div className="h-px w-12 bg-rose-200" />
                </div>
                <p className="text-gray-500 text-sm mb-1">
                    {WEDDING.rsvpDeadline}までに
                </p>
                <p className="text-gray-500 text-sm mb-10">
                    ご回答をお願い申し上げます
                </p>
                <Link
                    href="/rsvp"
                    className="inline-block border border-rose-400 text-rose-400 px-10 py-4 text-sm tracking-widest hover:bg-rose-400 hover:text-white transition-colors"
                >
                    出欠を回答する
                </Link>
            </section>

            {/* ── Footer ──────────────────────────────────────── */}
            <footer className="py-8 text-center bg-gray-800">
                <p className="text-gray-400 text-xs tracking-widest">
                    {WEDDING.groomEn} &amp; {WEDDING.brideEn} — {WEDDING.dateFooter}
                </p>
            </footer>
        </main>
    );
}
