// LoginSection test file
// Focuses on testing LoginSection component using mocked AuthForm
// Tests scenarios such as rendering content

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginSection } from "@/components/landing/LoginSection";

vi.mock("@/components/authentication/AuthForm", () => {
  return {
    default: vi.fn(({ onLogin }) => (
      <div data-testid="mock-auth-form">
        <button onClick={onLogin}>Mock Login Trigger</button>
      </div>
    )),
  };
});

describe("LoginSection", () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the heading and description", () => {
    render(<LoginSection onLogin={mockOnLogin} />);

    expect(screen.getByText("Welcome to the Community")).toBeDefined();
    expect(
      screen.getByText(/Sign in with your Bluesky account/i),
    ).toBeDefined();
  });

  it("should render the features list correctly", () => {
    render(<LoginSection onLogin={mockOnLogin} />);

    expect(screen.getByText("Rate")).toBeDefined();
    expect(screen.getByText("Review")).toBeDefined();
    expect(screen.getByText("Connect")).toBeDefined();
  });

  it("should pass the onLogin prop to the AuthForm", () => {
    render(<LoginSection onLogin={mockOnLogin} />);

    const loginBtn = screen.getByText("Mock Login Trigger");
    loginBtn.click();

    expect(mockOnLogin).toHaveBeenCalledTimes(1);
  });

  it("should display the current year in the footer", () => {
    render(<LoginSection onLogin={mockOnLogin} />);

    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeDefined();
  });

  it("should have the correct section ID for scroll navigation", () => {
    const { container } = render(<LoginSection onLogin={mockOnLogin} />);
    const section = container.querySelector("section");
    expect(section?.id).toBe("login-section");
  });
});
