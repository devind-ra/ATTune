import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AlbumHeader } from "@/components/album/AlbumHeader";

describe("AlbumHeader", () => {
  const mockProps = {
    name: "The Dark Side of the Moon",
    artist: "Pink Floyd",
    img: {
      "#text": "https://example.com/cover.jpg",
      size: "extralarge",
    } as any,
    releaseDate: "1 March 1973",
  };

  it("should render the album name, artist and release date correctly", () => {
    render(<AlbumHeader {...mockProps} />);

    expect(screen.getByText(mockProps.name)).toBeDefined();
    expect(screen.getByText(mockProps.artist)).toBeDefined();
    expect(
      screen.getByText(`Released: ${mockProps.releaseDate}`),
    ).toBeDefined();
  });

  it("should render the album cover image when provided", () => {
    render(<AlbumHeader {...mockProps} />);

    const img = screen.getByRole("img", {
      name: /the dark side of the moon cover/i,
    });
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toContain("cover.jpg");
  });

  it("should render a placeholder when no image is provided", () => {
    render(<AlbumHeader {...mockProps} img={undefined} />);

    expect(screen.getByText("N/A")).toBeDefined();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("should contain a link to the artist page with the correct encoded URL", () => {
    render(<AlbumHeader {...mockProps} />);

    const link = screen.getByRole("link");
    const expectedPath = `/artist/${encodeURIComponent(mockProps.artist)}`;

    expect(link.getAttribute("href")).toBe(expectedPath);
  });
});
