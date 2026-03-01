"use client";

import Image from "next/image";
import { useRef, useState, useCallback } from "react";

const PHOTOS = [
    "/images/top_1.jpg",
    "/images/top_2.jpg",
    "/images/top_3.jpg",
    "/images/top_4.jpg",
    "/images/top_5.jpg",
];

export default function PhotoCarousel() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [current, setCurrent] = useState(0);

    const scrollTo = useCallback((index: number) => {
        const el = scrollRef.current;
        if (!el) return;
        const width = el.clientWidth;
        el.scrollTo({ left: width * index, behavior: "smooth" });
        setCurrent(index);
    }, []);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const index = Math.round(el.scrollLeft / el.clientWidth);
        setCurrent(index);
    }, []);

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* スクロールコンテナ */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {PHOTOS.map((src, i) => (
                    <div
                        key={src}
                        className="flex-shrink-0 w-full snap-center"
                    >
                        <div className="relative w-full aspect-[4/3]">
                            <Image
                                src={src}
                                alt={`Wedding photo ${i + 1}`}
                                fill
                                className="object-cover"
                                priority={i === 0}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* 前へボタン */}
            {current > 0 && (
                <button
                    onClick={() => scrollTo(current - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-600 rounded-full w-9 h-9 flex items-center justify-center shadow transition"
                    aria-label="前の写真"
                >
                    ‹
                </button>
            )}

            {/* 次へボタン */}
            {current < PHOTOS.length - 1 && (
                <button
                    onClick={() => scrollTo(current + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-600 rounded-full w-9 h-9 flex items-center justify-center shadow transition"
                    aria-label="次の写真"
                >
                    ›
                </button>
            )}

            {/* ドットインジケーター */}
            <div className="flex justify-center gap-2 mt-3">
                {PHOTOS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => scrollTo(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            i === current ? "bg-sage-400" : "bg-gray-300"
                        }`}
                        aria-label={`写真 ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
