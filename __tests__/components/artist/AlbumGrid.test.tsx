import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AlbumGrid } from "@/components/artist/AlbumGrid";

vi.mock("@/lib/utils", () => ({
  getArtistName: vi.fn((artist) =>
    typeof artist === "string" ? artist : artist.name,
  ),
}));

describe("AlbumGrid", () => {
  const mockAlbums = [
    {
      name: "Bleach",
      artist: { name: "Nirvana" },
      image: [
        { "#text": "small.jpg", size: "small" },
        { "#text": "large.jpg", size: "extralarge" },
      ],
    },
    {
      name: "In Utero",
      artist: "Nirvana",
      image: [],
    },
  ];

  it("should render a list of albums correctly", () => {
    render(<AlbumGrid albums={mockAlbums as any} />);

    expect(screen.getByText("Discography")).toBeDefined();
    expect(screen.getByText("Bleach")).toBeDefined();
    expect(screen.getByText("In Utero")).toBeDefined();

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(2);
  });

  it("should return null when the album list is empty", () => {
    const { container } = render(<AlbumGrid albums={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("should construct the correct link with encoded parameters", () => {
    render(<AlbumGrid albums={[mockAlbums[0]] as any} />);

    const link = screen.getByRole("link");

    expect(link.getAttribute("href")).toBe(
      `/album/${encodeURIComponent("Nirvana")}/${encodeURIComponent("Bleach")}`,
    );
  });

  it("should prioritise extralarge images over other sizes", () => {
    render(<AlbumGrid albums={[mockAlbums[0]] as any} />);

    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toBe("large.jpg");
  });

  it("should render a placeholder 'N/A' when no image text is present", () => {
    render(<AlbumGrid albums={[mockAlbums[1]] as any} />);

    expect(screen.getByText("N/A")).toBeDefined();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("should handle complex artist names with special characters in the URL", () => {
    const complexAlbum = {
      name: "A & B",
      artist: "Artist @ Work",
      image: [],
    };

    render(<AlbumGrid albums={[complexAlbum] as any} />);

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toContain(encodeURIComponent("A & B"));
    expect(link.getAttribute("href")).toContain(
      encodeURIComponent("Artist @ Work"),
    );
  });
});
