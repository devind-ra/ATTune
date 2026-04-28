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

  it("should call setIdentifier when the handle input changes", () => {
    const setIdentifierMock = vi.fn();
    vi.mocked(useAuthForm).mockReturnValue({
      identifier: "",
      setIdentifier: setIdentifierMock,
      password: "",
      setPassword: vi.fn(),
      error: "",
      loading: false,
      handleLogin: vi.fn(),
    } as any);

    render(<AuthForm onLogin={mockOnLogin} />);

    const input = screen.getByPlaceholderText("alice.bsky.social");
    fireEvent.change(input, { target: { value: "test-user" } });

    expect(setIdentifierMock).toHaveBeenCalledWith("test-user");
  });

  it("should call setPassword when the password input changes", () => {
    const setPasswordMock = vi.fn();
    vi.mocked(useAuthForm).mockReturnValue({
      identifier: "",
      setIdentifier: vi.fn(),
      password: "",
      setPassword: setPasswordMock,
      error: "",
      loading: false,
      handleLogin: vi.fn(),
    } as any);

    render(<AuthForm onLogin={mockOnLogin} />);

    const input = screen.getByPlaceholderText("xxxx-xxxx-xxxx-xxxx");
    fireEvent.change(input, { target: { value: "password123" } });

    expect(setPasswordMock).toHaveBeenCalledWith("password123");
  });

  it("should display the error message when it exists", () => {
    const errorMessage = "Invalid credentials";
    vi.mocked(useAuthForm).mockReturnValue({
      identifier: "",
      setIdentifier: vi.fn(),
      password: "",
      setPassword: vi.fn(),
      error: errorMessage,
      loading: false,
      handleLogin: vi.fn(),
    } as any);

    render(<AuthForm onLogin={mockOnLogin} />);

    expect(screen.getByText(errorMessage)).toBeDefined();
  });

  it("should call handleLogin when the form is submitted", () => {
    const handleLoginMock = vi.fn((e) => e.preventDefault());
    vi.mocked(useAuthForm).mockReturnValue({
      identifier: "test",
      password: "password",
      setIdentifier: vi.fn(),
      setPassword: vi.fn(),
      error: "",
      loading: false,
      handleLogin: handleLoginMock,
    } as any);

    render(<AuthForm onLogin={mockOnLogin} />);

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    fireEvent.click(submitButton);

    expect(handleLoginMock).toHaveBeenCalled();
  });
});
