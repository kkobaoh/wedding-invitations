import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
    title: "Kazuki & Hina Wedding",
    description: "Kazuki & Hina の結婚式にご招待申し上げます",
};

export default function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html lang="ja">
            <body className="bg-stone-50 text-gray-700">{children}</body>
        </html>
    );
}
