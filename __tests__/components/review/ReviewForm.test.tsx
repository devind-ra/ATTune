import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReviewForm from "@/components/review/ReviewForm";
import { useReviewForm } from "@/app/hooks/useReviewForm";

vi.mock("@/app/hooks/useReviewForm", () => ({
  useReviewForm: vi.fn(),
}));

vi.mock("@/components/record/AlbumSearch", () => ({
  AlbumSearch: vi.fn(() => <div data-testid="mock-album-search" />),
}));

vi.mock("@/components/review/ReviewFormFields", () => ({
  ReviewFormFields: vi.fn(({ onBackToSearch }) => (
    <div data-testid="mock-form-fields">
      <button onClick={onBackToSearch}>Back to Search</button>
    </div>
  )),
}));

describe("ReviewForm", () => {
  const defaultHookReturn = {
    isSearchStep: true,
    searchQuery: "",
    setSearchQuery: vi.fn(),
    searchResults: [],
    isSearching: false,
    handleSelectAlbum: vi.fn(),
    handleSubmit: vi.fn((e) => e.preventDefault()),
    title: "Test Album",
    artist: "Test Artist",
    albumImage: "",
    rating: 10,
    setRating: vi.fn(),
    text: "",
    setText: vi.fn(),
    listenedAt: "2024-01-01",
    setListenedAt: vi.fn(),
    publishToBluesky: true,
    setPublishToBluesky: vi.fn(),
    loading: false,
    error: null,
    handleBackToSearch: vi.fn(),
  };

  const defaultProps = {
    onReviewCreated: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useReviewForm).mockReturnValue(defaultHookReturn as any);
  });

  it("should render the search step by default", () => {
    render(<ReviewForm {...defaultProps} />);

    expect(screen.getByText("Add a Review")).toBeDefined();
    expect(screen.getByTestId("mock-album-search")).toBeDefined();
    expect(screen.queryByTestId("mock-form-fields")).toBeNull();
  });

  it("should render the form fields when isSearchStep is false", () => {
    vi.mocked(useReviewForm).mockReturnValue({
      ...defaultHookReturn,
      isSearchStep: false,
    } as any);

    render(<ReviewForm {...defaultProps} />);

    expect(screen.getByTestId("mock-form-fields")).toBeDefined();
    expect(screen.queryByTestId("mock-album-search")).toBeNull();
  });

  it("should display error message when form.error exists", () => {
    vi.mocked(useReviewForm).mockReturnValue({
      ...defaultHookReturn,
      error: "Failed to create review",
    } as any);

    render(<ReviewForm {...defaultProps} />);

    expect(screen.getByText("Failed to create review")).toBeDefined();
  });

  it("should call handleSubmit when the form is submitted", () => {
    const handleSubmitMock = vi.fn((e) => e.preventDefault());
    vi.mocked(useReviewForm).mockReturnValue({
      ...defaultHookReturn,
      isSearchStep: false,
      handleSubmit: handleSubmitMock,
    } as any);

    render(<ReviewForm {...defaultProps} />);

    const formElement = screen.getByTestId("mock-form-fields").closest("form");
    fireEvent.submit(formElement!);

    expect(handleSubmitMock).toHaveBeenCalled();
  });

  it("should pass correct initial values to the useReviewForm hook", () => {
    const initialProps = {
      ...defaultProps,
      initialTitle: "In Utero",
      initialArtist: "Nirvana",
    };

    render(<ReviewForm {...initialProps} />);

    expect(useReviewForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialTitle: "In Utero",
        initialArtist: "Nirvana",
        onReviewCreated: defaultProps.onReviewCreated,
      }),
    );
  });
});
