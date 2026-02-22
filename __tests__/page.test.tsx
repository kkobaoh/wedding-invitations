import { render, screen } from "@testing-library/react";
import Home from "../app/page";

describe("ホームページ", () => {
    it("カップルの英語名が表示される", () => {
        render(<Home />);
        expect(screen.getByText("Kazuki")).toBeInTheDocument();
        expect(screen.getByText("Hina")).toBeInTheDocument();
    });

    it("カップルの日本語名が表示される", () => {
        render(<Home />);
        expect(screen.getByText("小橋 一樹")).toBeInTheDocument();
        expect(screen.getByText("御崎 日菜")).toBeInTheDocument();
    });

    it("結婚式の日程が表示される", () => {
        render(<Home />);
        expect(screen.getByText("2026 . 6 . 6 SAT")).toBeInTheDocument();
    });

    it("招待メッセージが表示される", () => {
        render(<Home />);
        expect(screen.getByText("謹んでご案内申し上げます")).toBeInTheDocument();
    });

    it("RSVPリンクが /rsvp に向いている", () => {
        render(<Home />);
        const links = screen.getAllByRole("link", { name: "出欠を回答する" });
        expect(links.length).toBeGreaterThan(0);
        links.forEach((link) => {
            expect(link).toHaveAttribute("href", "/rsvp");
        });
    });

    it("式の詳細セクション（Ceremony / Reception / Venue）が表示される", () => {
        render(<Home />);
        expect(screen.getByText("Ceremony")).toBeInTheDocument();
        expect(screen.getByText("Reception")).toBeInTheDocument();
        expect(screen.getByText("Venue")).toBeInTheDocument();
    });

    it("会場名が表示される", () => {
        render(<Home />);
        expect(screen.getByText("〇〇グランドホテル")).toBeInTheDocument();
    });

    it("Google Maps リンクが表示される", () => {
        render(<Home />);
        expect(screen.getByText("Google Maps で開く")).toBeInTheDocument();
    });
});
