import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReviewSection } from "@/components/album/ReviewSection";
import { useAuth } from "@/contexts/AuthContext";

vi.mock("@/components/review/ReviewForm", () => ({
  default: ({ onReviewCreated, onCancel }: any) => (
    <div data-testid="review-form">
      <button onClick={onReviewCreated}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

vi.mock("@/components/review/ReviewList", () => ({
  default: () => <div data-testid="review-list" />,
}));

vi.mock("@/components/review/OtherReviewsList", () => ({
  default: () => <div data-testid="other-reviews-list" />,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("ReviewSection", () => {
  const mockProps = {
    albumName: "Nevermind",
    artistName: "Nirvana",
    img: { "#text": "img-url", size: "large" as const },
    albumDisplayName: "Nevermind (Remastered)",
    artistDisplayName: "Nirvana",
  };

  const mockSession = { did: "did:plc:123", handle: "jdoe.bsky.social" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render nothing if there is no session", () => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      isLoading: false,
    } as any);
    const { container } = render(<ReviewSection {...mockProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render the 'Add a Review' button initially when logged in", () => {
    vi.mocked(useAuth).mockReturnValue({ session: mockSession } as any);
    render(<ReviewSection {...mockProps} />);

    expect(screen.getByRole("button", { name: /add a review/i })).toBeDefined();
    expect(screen.queryByTestId("review-form")).toBeNull();
  });

  it("should show the ReviewForm when 'Add a Review' is clicked", async () => {
    vi.mocked(useAuth).mockReturnValue({ session: mockSession } as any);
    render(<ReviewSection {...mockProps} />);

    const addButton = screen.getByRole("button", { name: /add a review/i });
    fireEvent.click(addButton);

    expect(screen.getByTestId("review-form")).toBeDefined();
    expect(screen.queryByRole("button", { name: /add a review/i })).toBeNull();
  });

  it("should close the form when onCancel is called", () => {
    vi.mocked(useAuth).mockReturnValue({ session: mockSession } as any);
    render(<ReviewSection {...mockProps} />);

    fireEvent.click(screen.getByRole("button", { name: /add a review/i }));
    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.queryByTestId("review-form")).toBeNull();
    expect(screen.getByRole("button", { name: /add a review/i })).toBeDefined();
  });

  it("should close the form and update lists when onReviewCreated is called", () => {
    vi.mocked(useAuth).mockReturnValue({ session: mockSession } as any);
    render(<ReviewSection {...mockProps} />);

    fireEvent.click(screen.getByRole("button", { name: /add a review/i }));

    fireEvent.click(screen.getByText("Submit"));

    expect(screen.queryByTestId("review-form")).toBeNull();
    expect(screen.getByRole("button", { name: /add a review/i })).toBeDefined();
  });

  it("should render the other users and current user review lists", () => {
    vi.mocked(useAuth).mockReturnValue({ session: mockSession } as any);
    render(<ReviewSection {...mockProps} />);

    expect(screen.getByTestId("other-reviews-list")).toBeDefined();
    expect(screen.getByTestId("review-list")).toBeDefined();
    expect(screen.getByText(mockSession.handle)).toBeDefined();
  });
});
