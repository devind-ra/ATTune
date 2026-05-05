// SettingsModal test file
// Focuses on testing SettingsModal using mocked useWipeData hook
// Testing scenarios such as rendering content, handling states and user interactions

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SettingsModal from "@/components/settings/SettingsModal";
import { useWipeData } from "@/app/hooks/useWipeData";

vi.mock("@/app/hooks/useWipeData", () => ({
  useWipeData: vi.fn(),
}));

describe("SettingsModal", () => {
  const mockOnClose = vi.fn();
  const mockSetPassword = vi.fn();
  const mockHandleWipeData = vi.fn();

  const defaultHookReturn = {
    password: "",
    setPassword: mockSetPassword,
    isDeleting: false,
    deleteError: null,
    handleWipeData: mockHandleWipeData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useWipeData as any).mockReturnValue(defaultHookReturn);

    vi.stubGlobal("alert", vi.fn());
  });

  it("should return null if isOpen is false", () => {
    const { container } = render(
      <SettingsModal isOpen={false} onClose={mockOnClose} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render the modal content when open", () => {
    render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText("Are you absolutely sure?")).toBeDefined();
    expect(screen.getByPlaceholderText("Enter your password")).toBeDefined();
  });

  it("should update password value on change", () => {
    render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText("Enter your password");
    fireEvent.change(input, { target: { value: "my-password-123" } });

    expect(mockSetPassword).toHaveBeenCalledWith("my-password-123");
  });

  it("should clear password and call onClose when Cancel is clicked", () => {
    render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(mockSetPassword).toHaveBeenCalledWith("");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should disable the Wipe button if password is empty", () => {
    render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

    const wipeBtn = screen.getByRole("button", { name: /permanently wipe/i });
    expect(wipeBtn).toBeDisabled();
  });

  it("should call handleWipeData when Wipe button is clicked with a password", () => {
    (useWipeData as any).mockReturnValue({
      ...defaultHookReturn,
      password: "valid-password",
    });

    render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

    const wipeBtn = screen.getByRole("button", { name: /permanently wipe/i });
    fireEvent.click(wipeBtn);

    expect(mockHandleWipeData).toHaveBeenCalled();
  });

  it("should show loading state during deletion", () => {
    (useWipeData as any).mockReturnValue({
      ...defaultHookReturn,
      password: "password",
      isDeleting: true,
    });

    render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

    const wipeBtn = screen.getByRole("button", { name: /deleting\.\.\./i });
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });

    expect(wipeBtn).toBeDisabled();
    expect(cancelBtn).toBeDisabled();

    expect(wipeBtn.querySelector(".animate-spin")).toBeDefined();
  });

  it("should display the error message if deleteError exists", () => {
    (useWipeData as any).mockReturnValue({
      ...defaultHookReturn,
      deleteError: "Incorrect password",
    });

    render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText("Incorrect password")).toHaveClass("text-red-500");
  });

  it("should execute the callback passed to handleWipeData on success", () => {
    mockHandleWipeData.mockImplementation((callback) => callback());

    (useWipeData as any).mockReturnValue({
      ...defaultHookReturn,
      password: "password",
      handleWipeData: mockHandleWipeData,
    });

    render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

    const wipeBtn = screen.getByRole("button", { name: /permanently wipe/i });
    fireEvent.click(wipeBtn);

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("permanently deleted"),
    );
    expect(mockOnClose).toHaveBeenCalled();
  });
});
