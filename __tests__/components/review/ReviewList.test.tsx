// ReviewList test file
// Focuses on testing ReviewList using default props and mocked useReviews and useReviewInteractions hooks and ReviewItem and CommentModal components
// Testing scenarios such as rendering content, handling states and user interactions

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReviewList from "@/components/review/ReviewList";
import { useReviews, UseReviewsProps } from "@/app/hooks/useReviews";
import { useReviewInteractions } from "@/app/hooks/useReviewInteractions";
import { MusicReview } from "@/lib/atproto";

const defaultProps: UseReviewsProps = {
  did: "did:plc:test123",
  refreshTrigger: 0,
};

vi.mock("@/app/hooks/useReviews");
vi.mock("@/app/hooks/useReviewInteractions");
vi.mock("@/components/review/ReviewItem", () => ({
  default: ({ item, onDelete, onEdit, onClick }: any) => (
    <div data-testid={`review-item-${item.uri}`} onClick={onClick}>
      <span>{item.value.subjectTitle}</span>
      <button onClick={() => onDelete(item.uri)}>Delete</button>
      <button onClick={() => onEdit(item)}>Edit</button>
    </div>
  ),
}));
vi.mock("@/components/review/CommentModal", () => ({
  CommentModal: ({ item, onClose }: any) => (
    <div data-testid="comment-modal">
      <span>{item.title}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const mockReviews = [
  {
    uri: "review-1",
    value: {
      subjectTitle: "Great Movie",
      subjectArtist: "Artist A",
      rating: 5,
      text: "Great movie!",
      listenedAt: "2022-01-01T00:00:00Z",
      postUri: "post-1",
      postCid: "post-cid-1",
      createdAt: "2022-01-01T00:00:00Z",
      updatedAt: "2022-01-01T00:00:00Z",
    } as MusicReview,
  },
  {
    uri: "review-2",
    value: {
      subjectTitle: "Okay Film",
      subjectArtist: "Artist B",
      rating: 3,
      text: "Okay film.",
      listenedAt: "2022-01-02T00:00:00Z",
      postUri: "post-2",
      postCid: "post-cid-2",
      createdAt: "2022-01-02T00:00:00Z",
      updatedAt: "2022-01-02T00:00:00Z",
    } as MusicReview,
  },
];

const mockRefresh = vi.fn();
const mockSetSelectedReview = vi.fn();
const mockHandleDelete = vi.fn();
const mockHandleEdit = vi.fn();

const defaultInteractions = {
  selectedReview: null,
  setSelectedReview: mockSetSelectedReview,
  handleDelete: mockHandleDelete,
  handleEdit: mockHandleEdit,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useReviewInteractions).mockReturnValue(defaultInteractions);
  vi.mocked(useReviews).mockReturnValue({
    reviews: mockReviews,
    loading: false,
    refresh: mockRefresh,
  });
});

describe("ReviewList", () => {
  it("should render loading indicator when loading is true", () => {
    vi.mocked(useReviews).mockReturnValue({
      reviews: [],
      loading: true,
      refresh: mockRefresh,
    });

    render(<ReviewList {...defaultProps} />);

    expect(screen.getByText("Loading reviews...")).toBeInTheDocument();
  });

  it("should not render review items while loading", () => {
    vi.mocked(useReviews).mockReturnValue({
      reviews: [],
      loading: true,
      refresh: mockRefresh,
    });

    render(<ReviewList {...defaultProps} />);

    expect(screen.queryByTestId(/review-item/)).not.toBeInTheDocument();
  });

  it("should render empty state message when there are no reviews", () => {
    vi.mocked(useReviews).mockReturnValue({
      reviews: [],
      loading: false,
      refresh: mockRefresh,
    });

    render(<ReviewList {...defaultProps} />);

    expect(
      screen.getByText("No reviews yet. Be the first!"),
    ).toBeInTheDocument();
  });

  it("should not render review items when reviews array is empty", () => {
    vi.mocked(useReviews).mockReturnValue({
      reviews: [],
      loading: false,
      refresh: mockRefresh,
    });

    render(<ReviewList {...defaultProps} />);

    expect(screen.queryByTestId(/review-item/)).not.toBeInTheDocument();
  });

  it("should render the instruction heading", () => {
    render(<ReviewList {...defaultProps} />);

    expect(
      screen.getByText(
        "Edit, delete a review or click on a review to view comments",
      ),
    ).toBeInTheDocument();
  });

  it("should render a ReviewItem for each review", () => {
    render(<ReviewList {...defaultProps} />);

    expect(screen.getByTestId("review-item-review-1")).toBeInTheDocument();
    expect(screen.getByTestId("review-item-review-2")).toBeInTheDocument();
  });

  it("should render the correct number of review items", () => {
    render(<ReviewList {...defaultProps} />);

    expect(screen.getAllByTestId(/review-item/)).toHaveLength(2);
  });

  it("should not render CommentModal when no review is selected", () => {
    render(<ReviewList {...defaultProps} />);

    expect(screen.queryByTestId("comment-modal")).not.toBeInTheDocument();
  });

  it("should call setSelectedReview with the review when a ReviewItem is clicked", () => {
    render(<ReviewList {...defaultProps} />);

    fireEvent.click(screen.getByTestId("review-item-review-1"));

    expect(mockSetSelectedReview).toHaveBeenCalledWith(mockReviews[0]);
  });

  it("should call handleDelete when delete is triggered on a ReviewItem", () => {
    render(<ReviewList {...defaultProps} />);

    fireEvent.click(screen.getAllByText("Delete")[0]);

    expect(mockHandleDelete).toHaveBeenCalledWith("review-1");
  });

  it("should call handleEdit when edit is triggered on a ReviewItem", () => {
    render(<ReviewList {...defaultProps} />);

    fireEvent.click(screen.getAllByText("Edit")[0]);

    expect(mockHandleEdit).toHaveBeenCalledWith(mockReviews[0]);
  });

  it("should render CommentModal when a review is selected", () => {
    vi.mocked(useReviews).mockReturnValue({
      reviews: mockReviews,
      loading: false,
      refresh: mockRefresh,
    });
    vi.mocked(useReviewInteractions).mockReturnValue({
      ...defaultInteractions,
      selectedReview: mockReviews[0],
    });

    render(<ReviewList {...defaultProps} />);

    expect(screen.getByTestId("comment-modal")).toBeInTheDocument();
    expect(screen.getByText("Great Movie")).toBeInTheDocument();
  });

  it("should call setSelectedReview with null when CommentModal is closed", () => {
    vi.mocked(useReviews).mockReturnValue({
      reviews: mockReviews,
      loading: false,
      refresh: mockRefresh,
    });
    vi.mocked(useReviewInteractions).mockReturnValue({
      ...defaultInteractions,
      selectedReview: mockReviews[0],
    });

    render(<ReviewList {...defaultProps} />);

    fireEvent.click(screen.getByText("Close"));

    expect(mockSetSelectedReview).toHaveBeenCalledWith(null);
  });
});
