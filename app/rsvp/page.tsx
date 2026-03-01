"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { WEDDING } from "@/lib/wedding";

type Attendance = "attend" | "absent" | "";
type GuestSide = "groom" | "bride" | "";
type HairSet = "short" | "upstyle" | "mens" | "children" | "";
type Makeup = "full" | "base" | "";

type Guest = {
    name: string;
    furigana: string;
    hairSet: HairSet;
    makeup: Makeup;
    allergy: string;
};

type FormData = {
    name: string;
    furigana: string;
    attendance: Attendance;
    guestSide: GuestSide;
    guestCount: number;
    guests: Guest[];
    hairSet: HairSet;
    makeup: Makeup;
    allergy: string;
    postalCode: string;
    address: string;
    message: string;
};

type GuestErrors = Partial<Record<keyof Guest, string>>;

type Errors = Partial<
    Record<keyof Omit<FormData, "guests" | "guestCount">, string>
> & { guests?: GuestErrors[] };

// ── オプション定義 ───────────────────────────────────────────
const HAIR_SET_OPTIONS = [
    { value: "short" as const, label: "ショート", price: 5500 },
    { value: "upstyle" as const, label: "アップスタイル", price: 9900 },
    { value: "mens" as const, label: "メンズヘアセット", price: 5500 },
    {
        value: "children" as const,
        label: "お子様ヘアセット（10歳以下）",
        price: 5500,
    },
];

const MAKEUP_OPTIONS = [
    { value: "full" as const, label: "フルメイク", price: 8800 },
    {
        value: "base" as const,
        label: "ベースメイク（電子水スキンケア）",
        price: 11000,
    },
];

const fmt = (price: number) =>
    price.toLocaleString("ja-JP") + "円";

// ── スタイル定数 ─────────────────────────────────────────────
const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-300 transition-colors bg-white";
const labelClass = "block text-sm text-gray-600 mb-2";
const errorClass = "text-sage-400 text-xs mt-1";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ── ラジオカードコンポーネント ────────────────────────────────
// 通常のラジオ（再クリックで解除しない）
function RadioCard({
    name,
    value,
    checked,
    onChange,
    label,
    sub,
}: {
    name: string;
    value: string;
    checked: boolean;
    onChange: () => void;
    label: string;
    sub?: string;
}) {
    return (
        <label
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 border rounded-lg cursor-pointer transition-colors text-sm text-center ${checked
                ? "border-sage-400 bg-sage-50 text-sage-500"
                : "border-gray-200 text-gray-500 hover:border-sage-200"
                }`}
        >
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                className="sr-only"
            />
            <span>{label}</span>
            {sub && (
                <span
                    className={`text-xs ${checked ? "text-sage-400" : "text-gray-400"}`}
                >
                    {sub}
                </span>
            )}
        </label>
    );
}

// トグルカードコンポーネント（再クリックで選択解除）
function ToggleCard({
    checked,
    onToggle,
    label,
    sub,
}: {
    checked: boolean;
    onToggle: () => void;
    label: string;
    sub?: string;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 border rounded-lg cursor-pointer transition-colors text-sm text-center ${checked
                ? "border-sage-400 bg-sage-50 text-sage-500"
                : "border-gray-200 text-gray-500 hover:border-sage-200"
                }`}
        >
            <span>{label}</span>
            {sub && (
                <span
                    className={`text-xs ${checked ? "text-sage-400" : "text-gray-400"}`}
                >
                    {sub}
                </span>
            )}
        </button>
    );
}

// ── メインコンポーネント ─────────────────────────────────────
export default function RsvpPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        furigana: "",
        attendance: "",
        guestSide: "",
        guestCount: 1,
        guests: [],
        hairSet: "",
        makeup: "",
        allergy: "",
        postalCode: "",
        address: "",
        message: "",
    });
    const [errors, setErrors] = useState<Errors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [showHairSet, setShowHairSet] = useState(false);
    const [showMakeup, setShowMakeup] = useState(false);
    const [showCompanionHairSet, setShowCompanionHairSet] = useState<boolean[]>([]);
    const [showCompanionMakeup, setShowCompanionMakeup] = useState<boolean[]>([]);

    const set =
        (field: keyof Omit<FormData, "guests" | "guestCount">) =>
            (
                e: React.ChangeEvent<
                    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                >
            ) =>
                setFormData((prev) => ({ ...prev, [field]: e.target.value }));

    const setRadio =
        <K extends keyof FormData>(field: K, value: FormData[K]) =>
            () =>
                setFormData((prev) => ({ ...prev, [field]: value }));

    // 再クリックで選択解除するトグル（hairSet / makeup 用）
    const toggleOption =
        <K extends "hairSet" | "makeup">(field: K, value: FormData[K]) =>
            () =>
                setFormData((prev) => ({
                    ...prev,
                    [field]: prev[field] === value ? "" : value,
                }));

    const handleGuestCountChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const count = Number(e.target.value);
        const companionCount = count - 1;
        setFormData((prev) => {
            const newGuests = Array.from({ length: companionCount }, (_, i) => ({
                name: prev.guests[i]?.name ?? "",
                furigana: prev.guests[i]?.furigana ?? "",
                hairSet: prev.guests[i]?.hairSet ?? ("" as HairSet),
                makeup: prev.guests[i]?.makeup ?? ("" as Makeup),
                allergy: prev.guests[i]?.allergy ?? "",
            }));
            return { ...prev, guestCount: count, guests: newGuests };
        });
        setShowCompanionHairSet((prev) =>
            Array.from({ length: companionCount }, (_, i) => prev[i] ?? false)
        );
        setShowCompanionMakeup((prev) =>
            Array.from({ length: companionCount }, (_, i) => prev[i] ?? false)
        );
    };

    const setGuest =
        (index: number, field: keyof Guest) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                setFormData((prev) => {
                    const guests = [...prev.guests];
                    guests[index] = {
                        ...(guests[index] ?? { name: "", furigana: "", hairSet: "" as HairSet, makeup: "" as Makeup, allergy: "" }),
                        [field]: e.target.value,
                    };
                    return { ...prev, guests };
                });
            };

    const toggleCompanionOption =
        (index: number, field: "hairSet" | "makeup", value: HairSet | Makeup) =>
            () => {
                setFormData((prev) => {
                    const newGuests = [...prev.guests];
                    const g = newGuests[index]!;
                    (newGuests[index] as Guest) = {
                        ...g,
                        [field]: g[field] === value ? "" : value,
                    };
                    return { ...prev, guests: newGuests };
                });
            };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        const remaining = MAX_IMAGES - imageFiles.length;
        if (remaining <= 0) return;

        const toAdd = selected.slice(0, remaining).filter((f) => {
            if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
                setSubmitError("JPEG・PNG・WebP・GIF 形式の画像のみ選択できます");
                return false;
            }
            if (f.size > MAX_IMAGE_SIZE) {
                setSubmitError("1 枚あたり 5 MB 以内の画像を選択してください");
                return false;
            }
            return true;
        });

        if (toAdd.length === 0) return;
        setSubmitError(null);

        const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
        setImageFiles((prev) => [...prev, ...toAdd]);
        setImagePreviews((prev) => [...prev, ...newPreviews]);

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeImage = (index: number) => {
        const preview = imagePreviews[index];
        if (preview) URL.revokeObjectURL(preview);
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const validate = (): boolean => {
        const newErrors: Errors = {};
        if (!formData.name.trim()) newErrors.name = "お名前を入力してください";
        if (!formData.attendance) newErrors.attendance = "ご出欠を選択してください";

        const guestErrors: GuestErrors[] = [];
        let hasGuestError = false;
        formData.guests.forEach((g, i) => {
            const ge: GuestErrors = {};
            if (!g.name.trim()) {
                ge.name = "同行者のお名前を入力してください";
                hasGuestError = true;
            }
            guestErrors[i] = ge;
        });
        if (hasGuestError) newErrors.guests = guestErrors;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const uploadImages = async (): Promise<string[]> => {
        if (imageFiles.length === 0) return [];

        const urls: string[] = [];
        for (const file of imageFiles) {
            const blob = await upload(`rsvp/${Date.now()}-${file.name}`, file, {
                access: "public",
                handleUploadUrl: "/api/rsvp/images",
            });
            urls.push(blob.url);
        }
        return urls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const imageUrls = await uploadImages();

            const isAttending = formData.attendance === "attend";
            const payload = {
                name: formData.name,
                furigana: formData.furigana || undefined,
                attendance: formData.attendance,
                guestSide: formData.guestSide || undefined,
                guests: isAttending
                    ? formData.guests.map((g) => ({
                        name: g.name,
                        furigana: g.furigana || undefined,
                        hairSet: g.hairSet || undefined,
                        makeup: g.makeup || undefined,
                        allergy: g.allergy || undefined,
                    }))
                    : [],
                hairSet: isAttending ? formData.hairSet || undefined : undefined,
                makeup: isAttending ? formData.makeup || undefined : undefined,
                allergy: formData.allergy || undefined,
                postalCode: formData.postalCode || undefined,
                address: formData.address || undefined,
                message: formData.message || undefined,
                imageUrls,
            };

            const res = await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
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

    const isAttending = formData.attendance === "attend";

    return (
        <main className="min-h-screen bg-stone-50 py-16 px-4">
            <div className="max-w-lg mx-auto">
                {/* ヘッダー */}
                <div className="text-center mb-10">
                    <Link
                        href="/"
                        className="text-sage-400 text-xs tracking-widest hover:text-sage-500 transition-colors"
                    >
                        ← 招待状に戻る
                    </Link>
                    <div className="flex items-center gap-4 justify-center mt-6 mb-3">
                        <div className="h-px w-10 bg-sage-200" />
                        <span className="text-sage-300 text-xs tracking-[0.3em] uppercase">
                            RSVP
                        </span>
                        <div className="h-px w-10 bg-sage-200" />
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

                    {/* ご出欠 */}
                    <div>
                        <label className={labelClass}>
                            ご出欠 <span className="text-sage-400">*</span>
                        </label>
                        <div className="flex gap-4">
                            <RadioCard
                                name="attendance"
                                value="attend"
                                checked={formData.attendance === "attend"}
                                onChange={setRadio("attendance", "attend")}
                                label="出席"
                            />
                            <RadioCard
                                name="attendance"
                                value="absent"
                                checked={formData.attendance === "absent"}
                                onChange={setRadio("attendance", "absent")}
                                label="欠席"
                            />
                        </div>
                        {errors.attendance && (
                            <p className={errorClass}>{errors.attendance}</p>
                        )}
                    </div>

                    {/* 新郎・新婦どちらのゲストか */}
                    <div>
                        <label className={labelClass}>ご招待の区分</label>
                        <div className="flex gap-4">
                            <RadioCard
                                name="guestSide"
                                value="groom"
                                checked={formData.guestSide === "groom"}
                                onChange={setRadio("guestSide", "groom")}
                                label={`新郎（${WEDDING.groomJa}）側`}
                            />
                            <RadioCard
                                name="guestSide"
                                value="bride"
                                checked={formData.guestSide === "bride"}
                                onChange={setRadio("guestSide", "bride")}
                                label={`新婦（${WEDDING.brideJa}）側`}
                            />
                        </div>
                    </div>

                    {/* お名前 */}
                    <div>
                        <label className={labelClass}>
                            お名前 <span className="text-sage-400">*</span>
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
                    {/* ヘアセット（出席の場合のみ・アコーディオン） */}
                    {isAttending && (
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowHairSet((v) => !v)}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-600 hover:bg-stone-50 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    ヘアセット
                                    <span className="text-gray-400 text-xs">（任意）</span>
                                    {formData.hairSet && !showHairSet && (
                                        <span className="text-sage-400 text-xs">
                                            {HAIR_SET_OPTIONS.find(
                                                (o) => o.value === formData.hairSet
                                            )?.label}
                                        </span>
                                    )}
                                </span>
                                <span className="text-gray-400 text-xs">
                                    {showHairSet ? "▲" : "▼"}
                                </span>
                            </button>
                            {showHairSet && (
                                <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                                    {HAIR_SET_OPTIONS.map((opt) => (
                                        <ToggleCard
                                            key={opt.value}
                                            checked={formData.hairSet === opt.value}
                                            onToggle={toggleOption("hairSet", opt.value)}
                                            label={opt.label}
                                            sub={fmt(opt.price)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* メイク（出席の場合のみ・アコーディオン） */}
                    {isAttending && (
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowMakeup((v) => !v)}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-600 hover:bg-stone-50 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    メイク
                                    <span className="text-gray-400 text-xs">（任意）</span>
                                    {formData.makeup && !showMakeup && (
                                        <span className="text-sage-400 text-xs">
                                            {MAKEUP_OPTIONS.find(
                                                (o) => o.value === formData.makeup
                                            )?.label}
                                        </span>
                                    )}
                                </span>
                                <span className="text-gray-400 text-xs">
                                    {showMakeup ? "▲" : "▼"}
                                </span>
                            </button>
                            {showMakeup && (
                                <div className="px-4 pb-4 flex gap-3">
                                    {MAKEUP_OPTIONS.map((opt) => (
                                        <ToggleCard
                                            key={opt.value}
                                            checked={formData.makeup === opt.value}
                                            onToggle={toggleOption("makeup", opt.value)}
                                            label={opt.label}
                                            sub={fmt(opt.price)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* アレルギー・食事制限 */}
                    <div>
                        <label className={labelClass}>アレルギー・食事制限</label>
                        <textarea
                            value={formData.allergy}
                            onChange={set("allergy")}
                            placeholder="例：えび・かにアレルギー、ベジタリアン など"
                            rows={3}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    {/* 参加人数（出席の場合のみ） */}
                    {isAttending && (
                        <div>
                            <label className={labelClass}>参加人数</label>
                            <select
                                value={formData.guestCount}
                                onChange={handleGuestCountChange}
                                className={inputClass}
                            >
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <option key={n} value={n}>
                                        {n} 名
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* 同行者（2名以上の場合） */}
                    {isAttending &&
                        formData.guests.map((guest, i) => (
                            <div
                                key={i}
                                className="border border-gray-100 rounded-xl p-4 space-y-4 bg-stone-50"
                            >
                                <p className="text-sm text-gray-500">
                                    同行者 {i + 1} 名目
                                </p>
                                <div>
                                    <label className={labelClass}>
                                        お名前 <span className="text-sage-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={guest.name}
                                        onChange={setGuest(i, "name")}
                                        placeholder="山田 花子"
                                        className={inputClass}
                                    />
                                    {errors.guests?.[i]?.name && (
                                        <p className={errorClass}>
                                            {errors.guests[i].name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>ふりがな</label>
                                    <input
                                        type="text"
                                        value={guest.furigana}
                                        onChange={setGuest(i, "furigana")}
                                        placeholder="やまだ はなこ"
                                        className={inputClass}
                                    />
                                </div>
                                {/* ヘアセット */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCompanionHairSet((prev) =>
                                                prev.map((v, j) => (j === i ? !v : v))
                                            )
                                        }
                                        className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-600 hover:bg-stone-50 transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            ヘアセット
                                            <span className="text-gray-400 text-xs">（任意）</span>
                                            {guest.hairSet && !showCompanionHairSet[i] && (
                                                <span className="text-sage-400 text-xs">
                                                    {HAIR_SET_OPTIONS.find((o) => o.value === guest.hairSet)?.label}
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-gray-400 text-xs">
                                            {showCompanionHairSet[i] ? "▲" : "▼"}
                                        </span>
                                    </button>
                                    {showCompanionHairSet[i] && (
                                        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                                            {HAIR_SET_OPTIONS.map((opt) => (
                                                <ToggleCard
                                                    key={opt.value}
                                                    checked={guest.hairSet === opt.value}
                                                    onToggle={toggleCompanionOption(i, "hairSet", opt.value)}
                                                    label={opt.label}
                                                    sub={fmt(opt.price)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* メイク */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCompanionMakeup((prev) =>
                                                prev.map((v, j) => (j === i ? !v : v))
                                            )
                                        }
                                        className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-600 hover:bg-stone-50 transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            メイク
                                            <span className="text-gray-400 text-xs">（任意）</span>
                                            {guest.makeup && !showCompanionMakeup[i] && (
                                                <span className="text-sage-400 text-xs">
                                                    {MAKEUP_OPTIONS.find((o) => o.value === guest.makeup)?.label}
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-gray-400 text-xs">
                                            {showCompanionMakeup[i] ? "▲" : "▼"}
                                        </span>
                                    </button>
                                    {showCompanionMakeup[i] && (
                                        <div className="px-4 pb-4 flex gap-3">
                                            {MAKEUP_OPTIONS.map((opt) => (
                                                <ToggleCard
                                                    key={opt.value}
                                                    checked={guest.makeup === opt.value}
                                                    onToggle={toggleCompanionOption(i, "makeup", opt.value)}
                                                    label={opt.label}
                                                    sub={fmt(opt.price)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* アレルギー・食事制限 */}
                                <div>
                                    <label className={labelClass}>アレルギー・食事制限</label>
                                    <textarea
                                        value={guest.allergy}
                                        onChange={setGuest(i, "allergy")}
                                        placeholder="例：えび・かにアレルギー、ベジタリアン など"
                                        rows={2}
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>
                            </div>
                        ))}

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

                    {/* 画像添付 */}
                    <div>
                        <label className={labelClass}>
                            思い出の画像を送っていただけると嬉しいです！{" "}
                            <span className="text-gray-400 text-xs">
                                （最大 {MAX_IMAGES} 枚・各 5 MB 以内）
                            </span>
                        </label>

                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {imagePreviews.map((src, i) => (
                                    <div key={i} className="relative aspect-square">
                                        <Image
                                            src={src}
                                            alt={`添付画像 ${i + 1}`}
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-gray-800 transition-colors"
                                            aria-label="画像を削除"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {imageFiles.length < MAX_IMAGES && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-gray-200 rounded-lg py-4 text-gray-400 text-sm hover:border-sage-200 hover:text-sage-400 transition-colors"
                            >
                                + 画像を選択
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>

                    {/* 送信エラー */}
                    {submitError && (
                        <p className="text-sage-500 text-sm text-center bg-sage-50 border border-sage-200 rounded-lg px-4 py-3">
                            {submitError}
                        </p>
                    )}

                    {/* 送信ボタン */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-sage-400 text-white py-4 text-sm tracking-widest hover:bg-sage-500 transition-colors disabled:opacity-60 rounded-lg"
                    >
                        {isSubmitting ? "送信中..." : "回答を送信する"}
                    </button>
                </form>
            </div>
        </main>
    );
}
