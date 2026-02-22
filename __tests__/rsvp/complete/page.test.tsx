import { render, screen } from "@testing-library/react";
import CompletePage from "../../../app/rsvp/complete/page";

describe("完了ページ", () => {
    it("完了見出しが表示される", () => {
        render(<CompletePage />);
        expect(screen.getByText("Complete")).toBeInTheDocument();
    });

    it("お礼メッセージが表示される", () => {
        render(<CompletePage />);
        expect(screen.getByText("ご回答ありがとうございます")).toBeInTheDocument();
    });

    it("受付完了メッセージが表示される", () => {
        render(<CompletePage />);
        expect(screen.getByText("ご回答を受け付けました。")).toBeInTheDocument();
    });

    it("式の詳細カードが表示される", () => {
        const { container } = render(<CompletePage />);
        expect(screen.getByText("Wedding Details")).toBeInTheDocument();
        // 会場名と住所は同一 <span> 内にあるため container 全体で確認
        expect(container).toHaveTextContent("〇〇グランドホテル");
        expect(container).toHaveTextContent("東京都千代田区〇〇1-2-3");
    });

    it("招待状に戻るリンクが / に向いている", () => {
        render(<CompletePage />);
        const link = screen.getByRole("link", { name: "招待状に戻る" });
        expect(link).toHaveAttribute("href", "/");
    });

    it("挙式・披露宴の時刻が表示される", () => {
        const { container } = render(<CompletePage />);
        // 日時と時刻は同一 <span> 内にあるため container 全体で確認
        expect(container).toHaveTextContent("挙式 12:00");
        expect(container).toHaveTextContent("披露宴 13:30");
    });
});
