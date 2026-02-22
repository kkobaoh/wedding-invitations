import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import RsvpPage from "../../app/rsvp/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
    mockPush.mockClear();
});

describe("RSVPフォーム — 表示", () => {
    it("フォームの各入力欄が表示される", () => {
        render(<RsvpPage />);
        expect(screen.getByPlaceholderText("山田 太郎")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("やまだ たろう")).toBeInTheDocument();
        expect(screen.getByText("喜んで出席")).toBeInTheDocument();
        expect(screen.getByText("誠に残念ながら欠席")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "回答を送信する" })).toBeInTheDocument();
    });

    it("初期状態では参加人数が表示されない", () => {
        render(<RsvpPage />);
        expect(screen.queryByText("参加人数")).not.toBeInTheDocument();
    });

    it("招待状に戻るリンクが表示される", () => {
        render(<RsvpPage />);
        expect(screen.getByText("← 招待状に戻る")).toBeInTheDocument();
    });
});

describe("RSVPフォーム — バリデーション", () => {
    it("名前未入力のまま送信するとエラーが表示される", async () => {
        render(<RsvpPage />);
        fireEvent.click(screen.getByRole("button", { name: "回答を送信する" }));
        await waitFor(() => {
            expect(screen.getByText("お名前を入力してください")).toBeInTheDocument();
        });
    });

    it("出欠未選択のまま送信するとエラーが表示される", async () => {
        render(<RsvpPage />);
        fireEvent.change(screen.getByPlaceholderText("山田 太郎"), {
            target: { value: "山田 太郎" },
        });
        fireEvent.click(screen.getByRole("button", { name: "回答を送信する" }));
        await waitFor(() => {
            expect(screen.getByText("ご出欠を選択してください")).toBeInTheDocument();
        });
    });

    it("名前と出欠を入力するとエラーが表示されない", async () => {
        render(<RsvpPage />);
        fireEvent.change(screen.getByPlaceholderText("山田 太郎"), {
            target: { value: "山田 太郎" },
        });
        fireEvent.click(screen.getByText("喜んで出席"));
        fireEvent.click(screen.getByRole("button", { name: "回答を送信する" }));
        await waitFor(() => {
            expect(screen.queryByText("お名前を入力してください")).not.toBeInTheDocument();
            expect(screen.queryByText("ご出欠を選択してください")).not.toBeInTheDocument();
        });
    });

    it("空白のみの名前はバリデーションエラーになる", async () => {
        render(<RsvpPage />);
        fireEvent.change(screen.getByPlaceholderText("山田 太郎"), {
            target: { value: "   " },
        });
        fireEvent.click(screen.getByRole("button", { name: "回答を送信する" }));
        await waitFor(() => {
            expect(screen.getByText("お名前を入力してください")).toBeInTheDocument();
        });
    });
});

describe("RSVPフォーム — 出欠選択の条件表示", () => {
    it("「喜んで出席」を選択すると参加人数が表示される", () => {
        render(<RsvpPage />);
        fireEvent.click(screen.getByText("喜んで出席"));
        expect(screen.getByText("参加人数")).toBeInTheDocument();
    });

    it("「誠に残念ながら欠席」を選択すると参加人数が表示されない", () => {
        render(<RsvpPage />);
        fireEvent.click(screen.getByText("誠に残念ながら欠席"));
        expect(screen.queryByText("参加人数")).not.toBeInTheDocument();
    });

    it("出席から欠席に切り替えると参加人数が非表示になる", () => {
        render(<RsvpPage />);
        fireEvent.click(screen.getByText("喜んで出席"));
        expect(screen.getByText("参加人数")).toBeInTheDocument();
        fireEvent.click(screen.getByText("誠に残念ながら欠席"));
        expect(screen.queryByText("参加人数")).not.toBeInTheDocument();
    });
});

describe("RSVPフォーム — 送信フロー", () => {
    it("送信中は「送信中...」と表示されボタンが無効になる", async () => {
        jest.useFakeTimers();
        render(<RsvpPage />);
        fireEvent.change(screen.getByPlaceholderText("山田 太郎"), {
            target: { value: "山田 太郎" },
        });
        fireEvent.click(screen.getByText("喜んで出席"));
        fireEvent.click(screen.getByRole("button", { name: "回答を送信する" }));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "送信中..." })).toBeDisabled();
        });

        jest.useRealTimers();
    });

    it("送信完了後に完了ページへ遷移する", async () => {
        jest.useFakeTimers();
        render(<RsvpPage />);
        fireEvent.change(screen.getByPlaceholderText("山田 太郎"), {
            target: { value: "山田 太郎" },
        });
        fireEvent.click(screen.getByText("喜んで出席"));
        fireEvent.click(screen.getByRole("button", { name: "回答を送信する" }));

        await act(async () => {
            jest.advanceTimersByTime(600);
        });

        expect(mockPush).toHaveBeenCalledWith("/rsvp/complete");
        jest.useRealTimers();
    });
});
