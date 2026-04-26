import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommentModal } from "@/components/review/CommentModal";

vi.mock("@/components/review/ReviewItem", () => ({
  default: vi.fn(({ onDelete }) => (
    <div data-testid="mock-review-item">
      <button onClick={() => onDelete("test-uri")}>Trigger Delete</button>
    </div>
  )),
}));

vi.mock("@/components/review/ReviewComments", () => ({
  ReviewComments: vi.fn(() => <div data-testid="mock-comments" />),
}));

describe("CommentModal", () => {
  const mockItem = {
    uri: "at://1",
    value: { postUri: "post-1", postCid: "cid-1", albumName: "Test" },
  };

  const defaultProps = {
    item: mockItem as any,
    onClose: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    isReadOnly: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "unset";
  });

  it("should render the modal with ReviewItem and ReviewComments", () => {
    render(<CommentModal {...defaultProps} />);

    expect(screen.getByTestId("mock-review-item")).toBeDefined();
    expect(screen.getByTestId("mock-comments")).toBeDefined();
  });

  it("should lock body scroll on mount and unlock on unmount", () => {
    const { unmount } = render(<CommentModal {...defaultProps} />);
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("unset");
  });

  it("should call onClose when the Escape key is pressed", () => {
    render(<CommentModal {...defaultProps} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when clicking the backdrop", () => {
    const { container } = render(<CommentModal {...defaultProps} />);

    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("should NOT call onClose when clicking the modal content (propagation check)", () => {
    render(<CommentModal {...defaultProps} />);

    const modalContent = screen.getByTestId("mock-review-item").parentElement!;
    fireEvent.click(modalContent);

    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it("should call onClose when the '✕' button is clicked", () => {
    render(<CommentModal {...defaultProps} />);

    const closeBtn = screen.getByLabelText("Close modal");
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onDelete and then onClose when deletion is triggered in ReviewItem", () => {
    render(<CommentModal {...defaultProps} />);

    const deleteBtn = screen.getByText("Trigger Delete");
    fireEvent.click(deleteBtn);

    expect(defaultProps.onDelete).toHaveBeenCalledWith("test-uri");
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("should clean up the keydown listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<CommentModal {...defaultProps} />);

    unmount();
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });
});
