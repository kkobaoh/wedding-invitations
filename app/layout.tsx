import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: "Kazuki & Hina Wedding",
    description: "Kazuki & Hina の結婚式にご招待申し上げます",
    openGraph: {
        title: "Kazuki & Hina Wedding",
        description: "Kazuki & Hina の結婚式にご招待申し上げます",
        url: siteUrl,
        type: "website",
        locale: "ja_JP",
        images: [
            {
                url: "/images/top_1.jpg",
                alt: "Kazuki & Hina Wedding",
            },
        ],
    },
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
