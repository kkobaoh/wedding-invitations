"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WEDDING } from "@/lib/wedding";

type Attendance = "attend" | "absent" | "";

type FormData = {
    name: string;
    furigana: string;
    attendance: Attendance;
    guestCount: string;
    dietaryRestrictions: string;
    postalCode: string;
    address: string;
    message: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-colors bg-white";
const labelClass = "block text-sm text-gray-600 mb-2";
const errorClass = "text-rose-400 text-xs mt-1";

export default function RsvpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        name: "",
        furigana: "",
        attendance: "",
        guestCount: "1",
        dietaryRestrictions: "",
        postalCode: "",
        address: "",
        message: "",
    });
    const [errors, setErrors] = useState<Errors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const set = (field: keyof FormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

    const validate = (): boolean => {
        const newErrors: Errors = {};
        if (!formData.name.trim()) newErrors.name = "お名前を入力してください";
        if (!formData.attendance) newErrors.attendance = "ご出欠を選択してください";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const res = await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? "送信に失敗しました");
            }

            const params = new URLSearchParams({
                name: formData.name,
                attendance: formData.attendance,
            });
            router.push(`/rsvp/complete?${params}`);
        } catch (err) {
            setSubmitError(
                err instanceof Error
                    ? err.message
                    : "送信に失敗しました。時間をおいて再度お試しください。"
            );
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-stone-50 py-16 px-4">
            <div className="max-w-lg mx-auto">
                {/* ヘッダー */}
                <div className="text-center mb-10">
                    <Link
                        href="/"
                        className="text-rose-400 text-xs tracking-widest hover:text-rose-500 transition-colors"
                    >
                        ← 招待状に戻る
                    </Link>
                    <div className="flex items-center gap-4 justify-center mt-6 mb-3">
                        <div className="h-px w-10 bg-rose-200" />
                        <span className="text-rose-300 text-xs tracking-[0.3em] uppercase">
                            RSVP
                        </span>
                        <div className="h-px w-10 bg-rose-200" />
                    </div>
                    <h1 className="text-2xl font-light text-gray-700">出欠のご確認</h1>
                    <p className="text-gray-400 text-xs mt-2">
                        {WEDDING.rsvpDeadline}までにご回答ください
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-sm p-8 space-y-6"
                >
                    {/* お名前 */}
                    <div>
                        <label className={labelClass}>
                            お名前 <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={set("name")}
                            placeholder="山田 太郎"
                            className={inputClass}
                        />
                        {errors.name && <p className={errorClass}>{errors.name}</p>}
                    </div>

                    {/* ふりがな */}
                    <div>
                        <label className={labelClass}>ふりがな</label>
                        <input
                            type="text"
                            value={formData.furigana}
                            onChange={set("furigana")}
                            placeholder="やまだ たろう"
                            className={inputClass}
                        />
                    </div>

                    {/* ご出欠 */}
                    <div>
                        <label className={labelClass}>
                            ご出欠 <span className="text-rose-400">*</span>
                        </label>
                        <div className="flex gap-4">
                            {(
                                [
                                    { value: "attend", label: "喜んで出席" },
                                    { value: "absent", label: "誠に残念ながら欠席" },
                                ] as { value: Attendance; label: string }[]
                            ).map((opt) => (
                                <label
                                    key={opt.value}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-lg cursor-pointer transition-colors text-sm ${
                                        formData.attendance === opt.value
                                            ? "border-rose-400 bg-rose-50 text-rose-500"
                                            : "border-gray-200 text-gray-500 hover:border-rose-200"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="attendance"
                                        value={opt.value}
                                        checked={formData.attendance === opt.value}
                                        onChange={set("attendance")}
                                        className="sr-only"
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                        {errors.attendance && (
                            <p className={errorClass}>{errors.attendance}</p>
                        )}
                    </div>

                    {/* 参加人数（出席の場合のみ） */}
                    {formData.attendance === "attend" && (
                        <div>
                            <label className={labelClass}>参加人数</label>
                            <select
                                value={formData.guestCount}
                                onChange={set("guestCount")}
                                className={inputClass}
                            >
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <option key={n} value={String(n)}>
                                        {n} 名
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* アレルギー・食事制限 */}
                    <div>
                        <label className={labelClass}>アレルギー・食事制限</label>
                        <textarea
                            value={formData.dietaryRestrictions}
                            onChange={set("dietaryRestrictions")}
                            placeholder="例：えび・かにアレルギー、ベジタリアン など"
                            rows={3}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    {/* 郵便番号 */}
                    <div>
                        <label className={labelClass}>郵便番号</label>
                        <input
                            type="text"
                            value={formData.postalCode}
                            onChange={set("postalCode")}
                            placeholder="000-0000"
                            className={inputClass}
                        />
                    </div>

                    {/* ご住所 */}
                    <div>
                        <label className={labelClass}>ご住所</label>
                        <textarea
                            value={formData.address}
                            onChange={set("address")}
                            placeholder={"東京都〇〇区〇〇1-2-3\n〇〇マンション101"}
                            rows={3}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    {/* メッセージ */}
                    <div>
                        <label className={labelClass}>おふたりへのメッセージ</label>
                        <textarea
                            value={formData.message}
                            onChange={set("message")}
                            placeholder="ご自由にお書きください"
                            rows={5}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    {/* 送信エラー */}
                    {submitError && (
                        <p className="text-rose-500 text-sm text-center bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
                            {submitError}
                        </p>
                    )}

                    {/* 送信ボタン */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-rose-400 text-white py-4 text-sm tracking-widest hover:bg-rose-500 transition-colors disabled:opacity-60 rounded-lg"
                    >
                        {isSubmitting ? "送信中..." : "回答を送信する"}
                    </button>
                </form>
            </div>
        </main>
    );
}
