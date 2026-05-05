// AlbumWiki test file
// Focuses on testing the AlbumWiki component using mocked values
// Tests for scenario such as rendering content and styles

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AlbumWiki } from "@/components/album/AlbumWiki";

describe("AlbumWiki", () => {
  const mockWiki =
    "This album was <strong>revolutionary</strong> for its time.";
  const mockUrl =
    "https://www.last.fm/music/Pink+Floyd/The+Dark+Side+of+the+Moon";

  it("should render the HTML content correctly", () => {
    render(<AlbumWiki html={mockWiki} />);

    const wikiContainer = screen.getByText(/revolutionary/i);

    expect(wikiContainer.innerHTML).toContain("revolutionary");
    expect(wikiContainer).toBeDefined();
  });

  it("should return null if no html content is provided", () => {
    const { container } = render(<AlbumWiki html="" />);
    expect(container.firstChild).toBeNull();
  });

  it("should render the Last.fm link when a url is provided", () => {
    render(<AlbumWiki html={mockWiki} url={mockUrl} />);

    const link = screen.getByRole("link", {
      name: /view full album on last\.fm/i,
    });

    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe(mockUrl);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noreferrer");
  });

  it("should not render the link if url is missing", () => {
    render(<AlbumWiki html={mockWiki} />);

    const link = screen.queryByRole("link");
    expect(link).toBeNull();
  });

  it("should apply the scrollable styling classes", () => {
    const { container } = render(<AlbumWiki html={mockWiki} />);
    const div = container.querySelector("div");

    expect(div?.className).toContain("overflow-y-auto");
    expect(div?.className).toContain("max-h-32");
    expect(div?.className).toContain("prose");
  });
});
