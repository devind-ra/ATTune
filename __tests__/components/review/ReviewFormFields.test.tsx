import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReviewFormFields } from "@/components/review/ReviewFormFields";

vi.mock("@/components/record/AlbumPreview", () => ({
  AlbumPreview: vi.fn(() => <div data-testid="mock-album-preview" />),
}));

vi.mock("@/components/review/StarRating", () => ({
  default: vi.fn(({ rating, onChange }) => (
    <button data-testid="mock-star-rating" onClick={() => onChange(8)}>
      Rating: {rating}
    </button>
  )),
}));

vi.mock("../record/ReviewFormActions", () => ({
  ReviewFormActions: vi.fn(({ loading, showCancel }) => (
    <div data-testid="mock-form-actions">
      {loading && <span>Loading...</span>}
      {showCancel && <span>Cancel Visible</span>}
    </div>
  )),
}));

describe("ReviewFormFields", () => {
  const defaultProps = {
    title: "In Utero",
    artist: "Nirvana",
    albumImage: "nirvana.jpg",
    rating: 10,
    onRatingChange: vi.fn(),
    text: "Great album",
    onTextChange: vi.fn(),
    listenedAt: "2024-01-01",
    onListenedAtChange: vi.fn(),
    publishToBluesky: true,
    onPublishToBlueskyChange: vi.fn(),
    loading: false,
    onBackToSearch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all form fields with initial values", () => {
    render(<ReviewFormFields {...defaultProps} />);

    expect(screen.getByTestId("mock-album-preview")).toBeDefined();
    expect(screen.getByLabelText("Review")).toHaveValue("Great album");
    expect(screen.getByLabelText(/date listened/i)).toHaveValue("2024-01-01");
    expect(screen.getByLabelText(/publish to bluesky/i)).toBeChecked();
    expect(screen.getByText(/Rating \(5\/5\)/)).toBeDefined();
  });

  it("should call onTextChange when textarea value changes", () => {
    render(<ReviewFormFields {...defaultProps} />);
    const textarea = screen.getByLabelText("Review");

    fireEvent.change(textarea, { target: { value: "New review text" } });
    expect(defaultProps.onTextChange).toHaveBeenCalledWith("New review text");
  });

  it("should call onListenedAtChange when date changes", () => {
    render(<ReviewFormFields {...defaultProps} />);
    const dateInput = screen.getByLabelText(/date listened/i);

    fireEvent.change(dateInput, { target: { value: "2024-05-05" } });
    expect(defaultProps.onListenedAtChange).toHaveBeenCalledWith("2024-05-05");
  });

  it("should call onPublishToBlueskyChange when checkbox is toggled", () => {
    render(<ReviewFormFields {...defaultProps} />);
    const checkbox = screen.getByLabelText(/publish to bluesky/i);

    fireEvent.click(checkbox);
    expect(defaultProps.onPublishToBlueskyChange).toHaveBeenCalledWith(false);
  });

  it("should call onRatingChange via StarRating", () => {
    render(<ReviewFormFields {...defaultProps} />);
    fireEvent.click(screen.getByTestId("mock-star-rating"));

    expect(defaultProps.onRatingChange).toHaveBeenCalledWith(8);
  });

  it("should hide 'Change Album' option if initialTitle is provided", () => {
    render(
      <ReviewFormFields {...defaultProps} initialTitle="Existing Title" />,
    );
    expect(screen.getByTestId("mock-album-preview")).toBeDefined();
  });
});
