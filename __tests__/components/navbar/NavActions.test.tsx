import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NavActions } from "@/components/navbar/NavActions";

describe("NavActions", () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { replace: vi.fn() },
    });
  });

  it("should render navigation links", () => {
    render(<NavActions onLogout={mockOnLogout} />);

    const profileLink = screen.getByRole("link", { name: /profile/i });
    const exploreLink = screen.getByRole("link", { name: /explore/i });

    expect(profileLink.getAttribute("href")).toBe("/profile");
    expect(exploreLink.getAttribute("href")).toBe("/explore");
  });

  it("should navigate to /record when the Record button is clicked", () => {
    render(<NavActions onLogout={mockOnLogout} />);

    const recordBtn = screen.getByRole("button", { name: /record album/i });
    fireEvent.click(recordBtn);

    expect(window.location.replace).toHaveBeenCalledWith("/record");
  });

  it("should toggle the dropdown menu when the Account button is clicked", () => {
    render(<NavActions onLogout={mockOnLogout} />);

    const accountBtn = screen.getByRole("button", {
      name: /open account menu/i,
    });

    expect(screen.queryByRole("link", { name: /settings/i })).toBeNull();

    fireEvent.click(accountBtn);
    expect(screen.getByRole("link", { name: /settings/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeDefined();

    fireEvent.click(accountBtn);
    expect(screen.queryByRole("link", { name: /settings/i })).toBeNull();
  });

  it("should not close the dropdown when clicking inside the menu", () => {
    render(<NavActions onLogout={mockOnLogout} />);

    const accountBtn = screen.getByRole("button", {
      name: /open account menu/i,
    });
    fireEvent.click(accountBtn);
    expect(screen.getByRole("link", { name: /settings/i })).toBeDefined();

    const settingsLink = screen.getByRole("link", { name: /settings/i });
    fireEvent.mouseDown(settingsLink);
    expect(screen.queryByRole("link", { name: /settings/i })).not.toBeNull();
  });

  it("should call onLogout and close menu when Sign Out is clicked", () => {
    render(<NavActions onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole("button", { name: /open account menu/i }));

    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(signOutBtn);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: /sign out/i })).toBeNull();
  });

  it("should close the dropdown when clicking outside", () => {
    render(<NavActions onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole("button", { name: /open account menu/i }));
    expect(screen.getByRole("link", { name: /settings/i })).toBeDefined();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("link", { name: /settings/i })).toBeNull();
  });

  it("should close the dropdown when a menu link (Settings) is clicked", () => {
    render(<NavActions onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole("button", { name: /open account menu/i }));

    const settingsLink = screen.getByRole("link", { name: /settings/i });
    fireEvent.click(settingsLink);

    expect(screen.queryByRole("link", { name: /settings/i })).toBeNull();
  });

  it("should close the dropdown when the Help link is clicked", () => {
    render(<NavActions onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole("button", { name: /open account menu/i }));

    const helpLink = screen.getByRole("link", { name: /help/i });
    fireEvent.click(helpLink);

    expect(screen.queryByRole("link", { name: /help/i })).toBeNull();
  });
});
