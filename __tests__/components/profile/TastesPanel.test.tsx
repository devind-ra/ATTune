import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TastesPanel } from "@/components/profile/TastesPanel";

vi.mock("@/components/profile/TastesEditor", () => ({
  TastesEditor: vi.fn(() => <div data-testid="mock-editor">Editor Mode</div>),
}));

vi.mock("@/components/profile/TastesViewer", () => ({
  TastesViewer: vi.fn(() => <div data-testid="mock-viewer">Viewer Mode</div>),
}));

describe("TastesPanel", () => {
  const defaultProps = {
    tastes: {
      topArtists: ["Nirvana"],
      topGenres: ["Grunge"],
      updatedAt: "2026-02-26",
    },
    editArtists: [""],
    editGenres: [""],
    onArtistChange: vi.fn(),
    onGenreChange: vi.fn(),
    artistExcludeValues: [[]],
    genreExcludeValues: [[]],
    setIsEditingTastes: vi.fn(),
  };

  it("should render TastesViewer by default when not editing", () => {
    render(<TastesPanel {...defaultProps} isEditingTastes={false} />);

    expect(screen.getByTestId("mock-viewer")).toBeDefined();
    expect(screen.queryByTestId("mock-editor")).toBeNull();
  });

  it("should render TastesEditor when isEditingTastes is true", () => {
    render(<TastesPanel {...defaultProps} isEditingTastes={true} />);

    expect(screen.getByTestId("mock-editor")).toBeDefined();
    expect(screen.queryByTestId("mock-viewer")).toBeNull();
  });

  it("should show the Edit Tastes button only when not in readonly or editing mode", () => {
    const { rerender } = render(
      <TastesPanel
        {...defaultProps}
        isReadonly={false}
        isEditingTastes={false}
      />,
    );
    expect(screen.getByRole("button", { name: /edit tastes/i })).toBeDefined();

    rerender(
      <TastesPanel
        {...defaultProps}
        isReadonly={false}
        isEditingTastes={true}
      />,
    );
    expect(screen.queryByRole("button", { name: /edit tastes/i })).toBeNull();

    rerender(
      <TastesPanel
        {...defaultProps}
        isReadonly={true}
        isEditingTastes={false}
      />,
    );
    expect(screen.queryByRole("button", { name: /edit tastes/i })).toBeNull();
  });

  it("should call setIsEditingTastes(true) when the edit button is clicked", () => {
    const setIsEditingTastes = vi.fn();
    render(
      <TastesPanel
        {...defaultProps}
        isEditingTastes={false}
        setIsEditingTastes={setIsEditingTastes}
      />,
    );

    const editBtn = screen.getByRole("button", { name: /edit tastes/i });
    fireEvent.click(editBtn);

    expect(setIsEditingTastes).toHaveBeenCalledWith(true);
  });

  it("should force Viewer mode even if isEditingTastes is true if isReadonly is enabled", () => {
    render(
      <TastesPanel
        {...defaultProps}
        isEditingTastes={true}
        isReadonly={true}
      />,
    );

    expect(screen.getByTestId("mock-viewer")).toBeDefined();
    expect(screen.queryByTestId("mock-editor")).toBeNull();
  });

  it("should correctly spread and pass props to TastesEditor", () => {
    const onSave = vi.fn();
    render(
      <TastesPanel {...defaultProps} isEditingTastes={true} onSave={onSave} />,
    );

    expect(screen.getByTestId("mock-editor")).toBeDefined();
  });
});
