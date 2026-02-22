import Link from "next/link";
import { WEDDING } from "@/lib/wedding";

type Props = {
    searchParams: Promise<{ name?: string; attendance?: string }>;
};

export default async function CompletePage({ searchParams }: Props) {
    const { name, attendance } = await searchParams;
    const isAttending = attendance === "attend";

    return (
        <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full text-center">
                {/* チェックマークアイコン */}
                <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-8">
                    <svg
                        className="w-9 h-9 text-rose-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                {/* Complete ラベル */}
                <div className="flex items-center gap-4 justify-center mb-4">
                    <div className="h-px w-10 bg-rose-200" />
                    <span className="text-rose-300 text-xs tracking-[0.3em] uppercase">
                        Complete
                    </span>
                    <div className="h-px w-10 bg-rose-200" />
                </div>

                {/* タイトル */}
                <h1 className="text-2xl font-light text-gray-700 mb-6">
                    ご回答ありがとうございます
                </h1>

                {/* パーソナライズされたメッセージ */}
                <div className="text-gray-500 text-sm leading-loose mb-10 space-y-1">
                    <p className="text-gray-600">
                        {name ? `${name} 様のご回答を受け付けました。` : "ご回答を受け付けました。"}
                    </p>
                    <p>心よりお礼申し上げます。</p>
                    {isAttending ? (
                        <p className="mt-3">
                            当日 お会いできることを
                            <br />
                            心よりお待ちしております。
                        </p>
                    ) : (
                        <p className="mt-3">
                            当日のご参加は叶いませんが
                            <br />
                            またの機会にお会いできることを
                            <br />
                            楽しみにしております。
                        </p>
                    )}
                </div>

                {/* 式の詳細カード（出席者のみ表示） */}
                {isAttending && (
                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 text-left">
                        <div className="flex items-center gap-3 justify-center mb-6">
                            <div className="h-px w-8 bg-rose-200" />
                            <h2 className="text-xs tracking-[0.3em] text-gray-400 uppercase">
                                Wedding Details
                            </h2>
                            <div className="h-px w-8 bg-rose-200" />
                        </div>
                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="flex items-start gap-4">
                                <span className="text-rose-300 text-xs tracking-wider w-12 shrink-0 pt-0.5">
                                    日時
                                </span>
                                <span className="leading-relaxed">
                                    {WEDDING.dateJa}
                                    <br />
                                    挙式 {WEDDING.ceremonyTime} / 披露宴 {WEDDING.receptionTime}〜
                                </span>
                            </div>
                            <div className="h-px bg-gray-50" />
                            <div className="flex items-start gap-4">
                                <span className="text-rose-300 text-xs tracking-wider w-12 shrink-0 pt-0.5">
                                    会場
                                </span>
                                <span className="leading-relaxed">
                                    {WEDDING.venueName}
                                    <br />
                                    {WEDDING.venueAddress}
                                </span>
                            </div>
                            <div className="h-px bg-gray-50" />
                            <div className="flex items-start gap-4">
                                <span className="text-rose-300 text-xs tracking-wider w-12 shrink-0 pt-0.5">
                                    お問合
                                </span>
                                <span className="leading-relaxed">{WEDDING.venuePhone}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 招待状へ戻るボタン */}
                <Link
                    href="/"
                    className="inline-block border border-rose-400 text-rose-400 px-10 py-3 text-sm tracking-widest hover:bg-rose-400 hover:text-white transition-colors"
                >
                    招待状に戻る
                </Link>

                <p className="mt-12 text-gray-300 text-xs tracking-widest">
                    {WEDDING.groomEn} &amp; {WEDDING.brideEn} — {WEDDING.dateFooter}
                </p>
            </div>
        </main>
    );
}
