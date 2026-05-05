// TastesViewer test file
// Focuses on testing TastesViewer component using mocked API values
// Tests scenarios such as rendering content, empty states and styling

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TastesViewer } from "@/components/profile/TastesViewer";

describe("TastesViewer", () => {
  const mockTastes = {
    topArtists: ["Nirvana", "Radiohead"],
    topGenres: ["Grunge", "Alternative Rock"],
    updatedAt: "2026-02-26",
  };

  it("should render the artist list and genre tags correctly", () => {
    render(<TastesViewer tastes={mockTastes} />);

    expect(screen.getByText("Nirvana")).toBeDefined();
    expect(screen.getByText("Radiohead")).toBeDefined();
    expect(screen.getByText("1.")).toBeDefined();
    expect(screen.getByText("Grunge")).toBeDefined();
    expect(screen.getByText("Alternative Rock")).toBeDefined();
  });

  it("should construct encoded URLs for artist links", () => {
    const complexArtist = {
      topArtists: ["B&B @ The Club"],
      topGenres: [],
      updatedAt: "",
    };
    render(<TastesViewer tastes={complexArtist} />);

    const link = screen.getByRole("link", { name: "B&B @ The Club" });
    const encodedName = encodeURIComponent("B&B @ The Club");

    expect(link.getAttribute("href")).toBe(`/artist/${encodedName}`);
  });

  it("should show empty states when tastes is null", () => {
    render(<TastesViewer tastes={null} />);

    expect(screen.getByText("No artists added yet.")).toBeDefined();
    expect(screen.getByText("No genres added yet.")).toBeDefined();
  });

  it("should show empty states when arrays are empty", () => {
    render(
      <TastesViewer
        tastes={{
          topArtists: [],
          topGenres: [],
          updatedAt: "",
        }}
      />,
    );

    expect(screen.getByText("No artists added yet.")).toBeDefined();
    expect(screen.getByText("No genres added yet.")).toBeDefined();
  });

  it("should apply correct styling to genre tags", () => {
    render(<TastesViewer tastes={mockTastes} />);

    const genreTag = screen.getByText("Grunge");
    expect(genreTag).toHaveClass("bg-zinc-800", "rounded-full", "text-sm");
  });

  it("should apply hover and transition classes to artist links", () => {
    render(<TastesViewer tastes={mockTastes} />);

    const artistLink = screen.getByRole("link", { name: "Nirvana" });
    expect(artistLink).toHaveClass(
      "hover:text-sky-400",
      "hover:bg-sky-900/20",
      "transition-colors",
    );
  });
});
