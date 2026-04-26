import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AuthForm from "@/components/authentication/AuthForm";
import { useAuthForm } from "@/app/hooks/useAuthForm";

vi.mock("@/app/hooks/useAuthForm", () => ({
  useAuthForm: vi.fn(),
}));

vi.mock("@/components/authentication/AuthModals", () => ({
  AuthModals: ({ activeModal, onClose }: any) =>
    activeModal ? (
      <div data-testid="auth-modal">
        <span>Modal Active: {activeModal}</span>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

describe("AuthForm", () => {
  const mockOnLogin = vi.fn();
  const mockHandleLogin = vi.fn((e) => e.preventDefault());
  const mockSetIdentifier = vi.fn();
  const mockSetPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const defaultHookValues = {
      identifier: "",
      setIdentifier: vi.fn(),
      password: "",
      setPassword: vi.fn(),
      error: "" as string,
      loading: false,
      handleLogin: vi.fn(async (e) => e.preventDefault()),
    };
    vi.mocked(useAuthForm).mockReturnValue(defaultHookValues as any);
  });

  it("should show loading state on the submit button", () => {
    vi.mocked(useAuthForm).mockReturnValue({
      identifier: "",
      setIdentifier: mockSetIdentifier,
      password: "",
      setPassword: mockSetPassword,
      error: "",
      loading: true,
      handleLogin: mockHandleLogin,
    } as any);

    render(<AuthForm onLogin={mockOnLogin} />);
    const button = screen.getByRole("button", { name: /Signing in.../i });
    expect(button).toBeDisabled();
  });

  it("should render the form inputs and submit button", () => {
    render(<AuthForm onLogin={mockOnLogin} />);

    expect(screen.getByPlaceholderText("alice.bsky.social")).toBeDefined();
    expect(screen.getByPlaceholderText("xxxx-xxxx-xxxx-xxxx")).toBeDefined();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeDefined();
  });

  it("should open and close the help modal", () => {
    render(<AuthForm onLogin={mockOnLogin} />);

    fireEvent.click(screen.getByText(/Where do I get this\?/i));
    expect(screen.getByText("Modal Active: help")).toBeDefined();

    fireEvent.click(screen.getByText("Close Modal"));
    expect(screen.queryByTestId("auth-modal")).toBeNull();
  });

  it("should open the signup modal", () => {
    render(<AuthForm onLogin={mockOnLogin} />);

    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));
    expect(screen.getByText("Modal Active: signup")).toBeDefined();
  });
});
