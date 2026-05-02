import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StarRating from "@/components/review/StarRating";

describe("StarRating", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the star rating group", () => {
    render(<StarRating rating={0} />);
    expect(
      screen.getByRole("group", { name: "Star Rating" }),
    ).toBeInTheDocument();
  });

  it("should render 5 stars", () => {
    render(<StarRating rating={0} />);
    expect(screen.getAllByRole("button")).toHaveLength(10);
  });

  it("should render correct aria-labels for all half and full star buttons", () => {
    render(<StarRating rating={0} />);
    [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].forEach((val) => {
      expect(
        screen.getByRole("button", { name: `Rate ${val} stars` }),
      ).toBeInTheDocument();
    });
  });

  it("should not render interactive buttons when interactive=false", () => {
    render(<StarRating rating={6} interactive={false} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("should show no filled stars for rating 0", () => {
    const { container } = render(<StarRating rating={0} interactive={false} />);
    const overlays = container.querySelectorAll(".overflow-hidden");
    expect(overlays).toHaveLength(0);
  });

  it("should show a half star for rating 1 (0.5 display)", () => {
    const { container } = render(<StarRating rating={1} interactive={false} />);
    const overlays = container.querySelectorAll(".overflow-hidden");
    expect(overlays).toHaveLength(1);
    expect(overlays[0]).toHaveClass("w-1/2");
  });

  it("should show a full star for rating 2 (1 display)", () => {
    const { container } = render(<StarRating rating={2} interactive={false} />);
    const overlays = container.querySelectorAll(".overflow-hidden");
    expect(overlays).toHaveLength(1);
    expect(overlays[0]).toHaveClass("w-full");
  });

  it("should show 2.5 full stars and 1 half star for rating 5", () => {
    const { container } = render(<StarRating rating={5} interactive={false} />);
    const overlays = container.querySelectorAll(".overflow-hidden");
    expect(overlays).toHaveLength(3);
    const halfOverlay = Array.from(overlays).find((el) =>
      el.classList.contains("w-1/2"),
    );
    expect(halfOverlay).toBeInTheDocument();
  });

  it("should show all 5 full stars for rating 10", () => {
    const { container } = render(
      <StarRating rating={10} interactive={false} />,
    );
    const overlays = container.querySelectorAll(".overflow-hidden");
    expect(overlays).toHaveLength(5);
    overlays.forEach((overlay) => {
      expect(overlay).toHaveClass("w-full");
    });
  });

  it("should call onChange with correct value when a half-star button is clicked", () => {
    render(<StarRating rating={0} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Rate 0.5 stars" }));
    expect(mockOnChange).toHaveBeenCalledWith(1);
  });

  it("should call onChange with correct value when a full-star button is clicked", () => {
    render(<StarRating rating={0} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Rate 3 stars" }));
    expect(mockOnChange).toHaveBeenCalledWith(6);
  });

  it("should call onChange with 10 when the 5-star button is clicked", () => {
    render(<StarRating rating={0} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Rate 5 stars" }));
    expect(mockOnChange).toHaveBeenCalledWith(10);
  });

  it("should not throw when onChange is not provided and a button is clicked", () => {
    render(<StarRating rating={0} />);
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: "Rate 1 stars" })),
    ).not.toThrow();
  });

  it("should update displayed rating on hover", () => {
    const { container } = render(
      <StarRating rating={0} onChange={mockOnChange} />,
    );
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Rate 3 stars" }));
    const overlays = container.querySelectorAll(".overflow-hidden");
    expect(overlays).toHaveLength(3);
  });

  it("should reset displayed rating when mouse leaves the group", () => {
    const { container } = render(
      <StarRating rating={0} onChange={mockOnChange} />,
    );
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Rate 3 stars" }));
    fireEvent.mouseLeave(screen.getByRole("group", { name: "Star Rating" }));
    const overlays = container.querySelectorAll(".overflow-hidden");
    expect(overlays).toHaveLength(0);
  });

  it("should not reset hover state on mouse leave when interactive=false", () => {
    const { container } = render(<StarRating rating={6} interactive={false} />);
    fireEvent.mouseLeave(screen.getByRole("group", { name: "Star Rating" }));
    const overlays = container.querySelectorAll(".overflow-hidden");
    expect(overlays).toHaveLength(3);
  });

  it("should show half-star preview on half-button hover", () => {
    const { container } = render(
      <StarRating rating={0} onChange={mockOnChange} />,
    );
    fireEvent.mouseEnter(
      screen.getByRole("button", { name: "Rate 2.5 stars" }),
    );
    const overlays = container.querySelectorAll(".overflow-hidden");
    const halfOverlay = Array.from(overlays).find((el) =>
      el.classList.contains("w-1/2"),
    );
    expect(halfOverlay).toBeInTheDocument();
  });
});
