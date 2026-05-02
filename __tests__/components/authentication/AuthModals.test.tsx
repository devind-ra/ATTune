import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AuthModals } from "@/components/authentication/AuthModals";

describe("AuthModals", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render nothing when activeModal is null", () => {
    const { container } = render(
      <AuthModals activeModal={null} onClose={mockOnClose} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render the Help Modal content correctly", () => {
    render(<AuthModals activeModal="help" onClose={mockOnClose} />);

    expect(screen.getByText("How to get an App Password")).toBeDefined();
    expect(screen.getByText(/Settings/i)).toBeDefined();
    expect(screen.getByText(/ATtune/i)).toBeDefined();
  });

  it("should render the Signup Modal content correctly", () => {
    render(<AuthModals activeModal="signup" onClose={mockOnClose} />);

    expect(screen.getByText("Join Bluesky")).toBeDefined();
    expect(screen.getByText(/built on the AT Protocol/i)).toBeDefined();
    expect(
      screen.getByRole("link", { name: /go to bsky\.app to sign up/i }),
    ).toBeDefined();
  });

  it("should call onClose when the 'Close' button is clicked", () => {
    render(<AuthModals activeModal="help" onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when the backdrop is clicked", () => {
    const { container } = render(
      <AuthModals activeModal="help" onClose={mockOnClose} />,
    );

    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should not call onClose when the modal content itself is clicked", () => {
    render(<AuthModals activeModal="help" onClose={mockOnClose} />);

    const modalHeading = screen.getByText("How to get an App Password");
    fireEvent.click(modalHeading);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("should contain external links with correct attributes for security", () => {
    render(<AuthModals activeModal="help" onClose={mockOnClose} />);

    const link = screen.getByRole("link", { name: /settings/i });
    expect(link.getAttribute("target")).toBe("_blank");

    expect(link.getAttribute("href")).toBe("https://bsky.app/settings");
  });

  it("should not call onClose when the modal content itself is clicked", () => {
    render(<AuthModals activeModal="help" onClose={mockOnClose} />);

    const modalHeading = screen.getByText("How to get an App Password");
    fireEvent.click(modalHeading);

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
