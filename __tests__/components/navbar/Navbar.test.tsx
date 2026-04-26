import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Navbar from "@/components/navbar/Navbar";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/components/navbar/NavSearchForm", () => ({
  NavSearchForm: vi.fn(({ searchQuery, onChange, onSubmit, className }) => (
    <form
      data-testid="mock-search-form"
      className={className}
      onSubmit={onSubmit}
    >
      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={(e) => onChange(e.target.value)}
      />
    </form>
  )),
}));

vi.mock("@/components/navbar/NavActions", () => ({
  NavActions: vi.fn(({ onLogout }) => (
    <button data-testid="mock-logout-btn" onClick={onLogout}>
      Logout
    </button>
  )),
}));

describe("Navbar", () => {
  const mockPush = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useAuth as any).mockReturnValue({ logout: mockLogout });
  });

  it("should render the logo and brand name correctly", () => {
    render(<Navbar />);
    expect(screen.getByAltText("ATtune logo")).toBeDefined();
    expect(screen.getByText("ATtune")).toBeDefined();
  });

  it("should navigate to /home when the brand name is clicked", () => {
    render(<Navbar />);
    const brand = screen.getByText("ATtune");
    fireEvent.click(brand);
    expect(mockPush).toHaveBeenCalledWith("/home");
  });

  it("should update search query state when child input changes", () => {
    render(<Navbar />);
    const inputs = screen.getAllByTestId("search-input");
    fireEvent.change(inputs[0], { target: { value: "Nirvana" } });

    expect(inputs[0].getAttribute("value")).toBe("Nirvana");
  });

  it("should not navigate if the search query is empty or only whitespace", () => {
    render(<Navbar />);
    const forms = screen.getAllByTestId("mock-search-form");
    const inputs = screen.getAllByTestId("search-input");

    fireEvent.change(inputs[0], { target: { value: "   " } });
    fireEvent.submit(forms[0]);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should trim the search query before navigating", () => {
    render(<Navbar />);
    const forms = screen.getAllByTestId("mock-search-form");
    const inputs = screen.getAllByTestId("search-input");

    fireEvent.change(inputs[0], { target: { value: "  Nirvana  " } });
    fireEvent.submit(forms[0]);

    expect(mockPush).toHaveBeenCalledWith("/search?q=Nirvana");
  });

  it("should navigate to search page on form submission", () => {
    render(<Navbar />);
    const forms = screen.getAllByTestId("mock-search-form");
    const inputs = screen.getAllByTestId("search-input");

    fireEvent.change(inputs[0], { target: { value: "Radiohead" } });
    fireEvent.submit(forms[0]);

    expect(mockPush).toHaveBeenCalledWith("/search?q=Radiohead");
  });

  it("should pass the logout function to NavActions", () => {
    render(<Navbar />);
    const logoutBtn = screen.getByTestId("mock-logout-btn");
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("should sync search query with initialSearchQuery prop changes", () => {
    const { rerender } = render(<Navbar initialSearchQuery="initial" />);
    const input = screen.getAllByTestId("search-input")[0];
    expect(input.getAttribute("value")).toBe("initial");

    rerender(<Navbar initialSearchQuery="updated" />);
    expect(input.getAttribute("value")).toBe("updated");
  });

  it("should toggle the mobile menu visibility", () => {
    const { container } = render(<Navbar />);

    const mobileMenuContainer = container.querySelector(
      "header > div:nth-child(2)",
    );
    const toggleBtn = screen.getByLabelText("Toggle menu");

    expect(mobileMenuContainer).toHaveClass("hidden");
    expect(mobileMenuContainer).not.toHaveClass("flex");

    fireEvent.click(toggleBtn);
    expect(mobileMenuContainer).toHaveClass("flex");
    expect(mobileMenuContainer).not.toHaveClass("hidden");
    fireEvent.click(toggleBtn);
    expect(mobileMenuContainer).toHaveClass("hidden");
  });

  it("should navigate to search page on form submission", () => {
    render(<Navbar />);
    const forms = screen.getAllByTestId("mock-search-form");
    const inputs = screen.getAllByTestId("search-input");

    fireEvent.change(inputs[0], { target: { value: "Radiohead" } });
    fireEvent.submit(forms[0]);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("Radiohead"));
  });
});
