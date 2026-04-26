import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HeroSection } from "@/components/landing/HeroSection";

describe("HeroSection", () => {
  const mockOnScrollToLogin = vi.fn();

  it("should render the title and descriptions correctly", () => {
    render(<HeroSection onScrollToLogin={mockOnScrollToLogin} />);

    expect(screen.getByText("ATtune")).toBeDefined();

    expect(
      screen.getByText("Decentralised Music. Own Your Data."),
    ).toBeDefined();
    expect(
      screen.getByText(/Join the revolution of music discovery/i),
    ).toBeDefined();
  });

  it("should call onScrollToLogin when the 'Get Started' button is clicked", () => {
    render(<HeroSection onScrollToLogin={mockOnScrollToLogin} />);

    const button = screen.getByRole("button", { name: /get started/i });
    fireEvent.click(button);

    expect(mockOnScrollToLogin).toHaveBeenCalledTimes(1);
  });

  it("should call onScrollToLogin when the bouncing arrow icon is clicked", () => {
    render(<HeroSection onScrollToLogin={mockOnScrollToLogin} />);

    const bounceContainer = screen.getByRole("button", { name: /get started/i })
      .parentElement?.nextElementSibling;

    if (bounceContainer) {
      fireEvent.click(bounceContainer);
    }

    expect(mockOnScrollToLogin).toHaveBeenCalled();
  });

  it("should have the correct layout classes for a full-screen hero", () => {
    const { container } = render(
      <HeroSection onScrollToLogin={mockOnScrollToLogin} />,
    );

    const section = container.querySelector("section");
    expect(section).toHaveClass("h-screen", "w-full", "bg-zinc-950");
  });

  it("should have an animate-bounce class on the scroll indicator", () => {
    const { container } = render(
      <HeroSection onScrollToLogin={mockOnScrollToLogin} />,
    );

    const bounceDiv = container.querySelector(".animate-bounce");
    expect(bounceDiv).not.toBeNull();
  });
});
