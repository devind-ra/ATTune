import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecentReviews } from "@/components/profile/RecentReviews";
import { useReviewInteractions } from "@/app/hooks/useReviewInteractions";

vi.mock("@/app/hooks/useReviewInteractions", () => ({
  useReviewInteractions: vi.fn(),
}));

vi.mock("@/components/review/ReviewItem", () => ({
  default: vi.fn(({ item, onClick, onDelete }) => (
    <div data-testid="review-item">
      <span onClick={onClick}>{item.value.albumName}</span>
      <button onClick={() => onDelete(item.uri)}>Delete</button>
    </div>
  )),
}));

vi.mock("@/components/review/CommentModal", () => ({
  CommentModal: vi.fn(({ item, onClose }) => (
    <div data-testid="comment-modal">
      <p>Modal for {item.value.albumName}</p>
      <button onClick={onClose}>Close</button>
    </div>
  )),
}));

describe("RecentReviews", () => {
  const mockRefresh = vi.fn();
  const mockHandle = "user.bsky.social";
  const mockReviews = [
    {
      uri: "at://1",
      value: { albumName: "Bleach", artistName: "Nirvana", rating: 5 },
    },
  ];

  const mockInteractions = {
    selectedReview: null,
    setSelectedReview: vi.fn(),
    handleDelete: vi.fn(),
    handleEdit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useReviewInteractions as any).mockReturnValue(mockInteractions);
  });

  it("should return null if no reviews are present", () => {
    const { container } = render(
      <RecentReviews reviews={[]} refresh={mockRefresh} handle={mockHandle} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render the list of reviews", () => {
    render(
      <RecentReviews
        reviews={mockReviews as any}
        refresh={mockRefresh}
        handle={mockHandle}
      />,
    );

    expect(screen.getByText("Recent Reviews")).toBeDefined();
    expect(screen.getByTestId("review-item")).toBeDefined();
    expect(screen.getByText("Bleach")).toBeDefined();
  });

  it("should display the correct helper text for read-only mode", () => {
    const { rerender } = render(
      <RecentReviews
        reviews={mockReviews as any}
        refresh={mockRefresh}
        handle={mockHandle}
        isReadOnly={true}
      />,
    );
    expect(
      screen.getByText("Click on a review to view comments"),
    ).toBeDefined();

    rerender(
      <RecentReviews
        reviews={mockReviews as any}
        refresh={mockRefresh}
        handle={mockHandle}
        isReadOnly={false}
      />,
    );
    expect(screen.getByText(/Edit, delete a review/)).toBeDefined();
  });

  it("should open the CommentModal when a review is clicked", () => {
    (useReviewInteractions as any).mockReturnValue({
      ...mockInteractions,
      selectedReview: mockReviews[0],
    });

    render(
      <RecentReviews
        reviews={mockReviews as any}
        refresh={mockRefresh}
        handle={mockHandle}
      />,
    );

    expect(screen.getByTestId("comment-modal")).toBeDefined();
    expect(screen.getByText("Modal for Bleach")).toBeDefined();
  });

  it("should call setSelectedReview when a review item is clicked", () => {
    render(
      <RecentReviews
        reviews={mockReviews as any}
        refresh={mockRefresh}
        handle={mockHandle}
      />,
    );

    const itemText = screen.getByText("Bleach");
    fireEvent.click(itemText);

    expect(mockInteractions.setSelectedReview).toHaveBeenCalledWith(
      mockReviews[0],
    );
  });

  it("should construct the correct 'Show more' link for personal profile", () => {
    render(
      <RecentReviews
        reviews={mockReviews as any}
        refresh={mockRefresh}
        handle={mockHandle}
        isReadOnly={false}
      />,
    );

    const link = screen.getByRole("link", { name: /Show more reviews/i });
    expect(link.getAttribute("href")).toBe("/reviews");
  });

  it("should construct the correct 'Show more' link for other users' profiles", () => {
    render(
      <RecentReviews
        reviews={mockReviews as any}
        refresh={mockRefresh}
        handle={mockHandle}
        isReadOnly={true}
      />,
    );

    const link = screen.getByRole("link", { name: /Show more reviews/i });
    expect(link.getAttribute("href")).toBe(`/${mockHandle}/reviews`);
  });

  it("should call handleDelete through the hook logic", () => {
    render(
      <RecentReviews
        reviews={mockReviews as any}
        refresh={mockRefresh}
        handle={mockHandle}
      />,
    );

    const deleteBtn = screen.getByText("Delete");
    fireEvent.click(deleteBtn);

    expect(mockInteractions.handleDelete).toHaveBeenCalledWith("at://1");
  });

  it("should close the CommentModal by setting selectedReview to null", () => {
    const mockSetSelectedReview = vi.fn();
    (useReviewInteractions as any).mockReturnValue({
      ...mockInteractions,
      selectedReview: mockReviews[0],
      setSelectedReview: mockSetSelectedReview,
    });

    render(
      <RecentReviews
        reviews={mockReviews as any}
        refresh={mockRefresh}
        handle={mockHandle}
      />,
    );

    const closeBtn = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeBtn);

    expect(mockSetSelectedReview).toHaveBeenCalledWith(null);
  });
});
