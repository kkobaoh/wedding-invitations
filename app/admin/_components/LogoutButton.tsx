"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    }

    return (
        <button
            onClick={handleLogout}
            className="text-sm text-stone-500 hover:text-stone-700 border border-stone-300 hover:border-stone-400 px-3 py-1.5 rounded-lg transition"
        >
            ログアウト
        </button>
    );
}
