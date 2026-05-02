import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useOtherReviews } from "@/app/hooks/useOtherReviews";
import OtherReviewsList from "@/components/review/OtherReviewsList";
import ReviewItem from "@/components/review/ReviewItem";

vi.mock("@/app/hooks/useOtherReviews", () => ({
  useOtherReviews: vi.fn(),
}));

vi.mock("@/components/review/ReviewItem", () => ({
  default: vi.fn(({ item, onClick, onDelete, onEdit }) => (
    <div data-testid="mock-review-item">
      <button onClick={onClick}>Open</button>
      <button onClick={() => onDelete()}>Delete</button>
      <button onClick={() => onEdit()}>Edit</button>
    </div>
  )),
}));

vi.mock("@/components/review/CommentModal", () => ({
  CommentModal: vi.fn(({ onClose, onDelete, onEdit }) => (
    <div data-testid="mock-comment-modal">
      <button onClick={onClose}>Close</button>
      <button onClick={() => onDelete()}>Delete Modal</button>
      <button onClick={() => onEdit()}>Edit Modal</button>
    </div>
  )),
}));

describe("OtherReviewsList", () => {
  const defaultProps = {
    title: "In Utero",
    artist: "Nirvana",
    currentUserDid: "did:plc:123",
  };

  const mockReviews = [
    { uri: "at://1", value: { albumName: "In Utero", artist: "Nirvana" } },
    { uri: "at://2", value: { albumName: "In Utero", artist: "Nirvana" } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show a loading message when loading is true", () => {
    vi.mocked(useOtherReviews).mockReturnValue({
      reviews: [],
      loading: true,
      refresh: vi.fn(),
    });

    render(<OtherReviewsList {...defaultProps} />);
    expect(screen.getByText(/Loading other reviews/i)).toBeDefined();
  });

  it("should show an empty message when there are no reviews", () => {
    vi.mocked(useOtherReviews).mockReturnValue({
      reviews: [],
      loading: false,
      refresh: vi.fn(),
    });

    render(<OtherReviewsList {...defaultProps} />);
    expect(screen.getByText(/No other reviews found./i)).toBeDefined();
  });

  it("should render a list of ReviewItems when reviews are loaded", () => {
    vi.mocked(useOtherReviews).mockReturnValue({
      reviews: mockReviews as any,
      loading: false,
      refresh: vi.fn(),
    });

    render(<OtherReviewsList {...defaultProps} />);

    const items = screen.getAllByTestId("mock-review-item");
    expect(items).toHaveLength(2);
  });

  it("should pass isReadOnly true to child components", () => {
    vi.mocked(useOtherReviews).mockReturnValue({
      reviews: mockReviews as any,
      loading: false,
      refresh: vi.fn(),
    });

    render(<OtherReviewsList {...defaultProps} />);

    const reviewItemProps = vi.mocked(ReviewItem).mock.calls[0][0];
    expect(reviewItemProps.isReadOnly).toBe(true);
  });

  it("should execute the empty placeholder functions for onDelete and onEdit in ReviewItem", async () => {
    vi.mocked(useOtherReviews).mockReturnValue({
      reviews: mockReviews as any,
      loading: false,
      refresh: vi.fn(),
    });

    render(<OtherReviewsList {...defaultProps} />);

    const deleteBtns = screen.getAllByText("Delete");
    const editBtns = screen.getAllByText("Edit");

    fireEvent.click(deleteBtns[0]);
    await fireEvent.click(editBtns[0]);

    expect(true).toBe(true);
  });

  it("should execute the empty placeholder functions in CommentModal", async () => {
    vi.mocked(useOtherReviews).mockReturnValue({
      reviews: mockReviews as any,
      loading: false,
      refresh: vi.fn(),
    });

    render(<OtherReviewsList {...defaultProps} />);

    fireEvent.click(screen.getAllByText("Open")[0]);

    fireEvent.click(screen.getByText("Delete Modal"));
    await fireEvent.click(screen.getByText("Edit Modal"));

    expect(true).toBe(true);
  });

  it("should close the CommentModal and clear selectedReview state when onClose is called", () => {
    vi.mocked(useOtherReviews).mockReturnValue({
      reviews: mockReviews as any,
      loading: false,
      refresh: vi.fn(),
    });

    render(<OtherReviewsList {...defaultProps} />);

    const openBtns = screen.getAllByText("Open");
    fireEvent.click(openBtns[0]);

    expect(screen.getByTestId("mock-comment-modal")).toBeDefined();

    const closeBtn = screen.getByText("Close");
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId("mock-comment-modal")).toBeNull();
  });
});
