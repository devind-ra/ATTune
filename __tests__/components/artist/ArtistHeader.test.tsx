// ArtistHeader test file
// Focuses on testing ArtistHeader component using mocked API values
// Tests for scenario such as rendering artist info, name, stats, tags and biography

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ArtistHeader } from "@/components/artist/ArtistHeader";

describe("ArtistHeader", () => {
  const mockArtistInfo = {
    name: "Radiohead",
    url: "https://www.last.fm/music/Radiohead",
    stats: {
      listeners: "3500000",
      playcount: "150000000",
    },
    tags: {
      tag: [
        { name: "Alternative Rock", url: "" },
        { name: "Electronic", url: "" },
        { name: "Experimental", url: "" },
        { name: "Art Rock", url: "" },
        { name: "Post-Britpop", url: "" },
        { name: "Indie", url: "" },
      ],
    },
    bio: {
      summary:
        'Radiohead are an English rock band. <a href="https://www.last.fm/music/Radiohead">Read more on Last.fm</a>',
    },
  };

  it("should render the artist name correctly", () => {
    render(<ArtistHeader artistInfo={mockArtistInfo as any} />);
    expect(screen.getByText("Radiohead")).toBeDefined();
  });

  it("should format and display stats correctly using local strings", () => {
    render(<ArtistHeader artistInfo={mockArtistInfo as any} />);

    expect(screen.getByText(/3,500,000 Listeners/)).toBeDefined();
    expect(screen.getByText(/150,000,000 Scrobbles/)).toBeDefined();
  });

  it("should clean the biography by removing the Last.fm 'Read more' anchor tag", () => {
    render(<ArtistHeader artistInfo={mockArtistInfo as any} />);

    const bioElement = screen.getByText(/Radiohead are an English rock band/);

    expect(bioElement.innerHTML).not.toContain("Read more on Last.fm");
    expect(bioElement.innerHTML).not.toContain("<a href=");
  });

  it("should render the first 5 tags only", () => {
    render(<ArtistHeader artistInfo={mockArtistInfo as any} />);

    expect(screen.getByText("Alternative Rock")).toBeDefined();
    expect(screen.getByText("Post-Britpop")).toBeDefined();
    expect(screen.queryByText("Indie")).toBeNull();
  });

  it("should render fallback text when biography is missing", () => {
    const infoNoBio = { ...mockArtistInfo, bio: { summary: "" } };
    render(<ArtistHeader artistInfo={infoNoBio as any} />);

    expect(screen.getByText("No biography available.")).toBeDefined();
  });

  it("should return null for stats if listeners and playcount are missing", () => {
    const infoNoStats = { ...mockArtistInfo, stats: {} };
    render(<ArtistHeader artistInfo={infoNoStats as any} />);

    expect(screen.queryByText(/Listeners/)).toBeNull();
    expect(screen.queryByText(/Scrobbles/)).toBeNull();
  });

  it("should render the external link to Last.fm correctly", () => {
    render(<ArtistHeader artistInfo={mockArtistInfo as any} />);

    const link = screen.getByRole("link", {
      name: /view full profile on last\.fm/i,
    });
    expect(link.getAttribute("href")).toBe(mockArtistInfo.url);
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("should handle missing stats and tags objects gracefully", () => {
    const incompleteInfo = {
      name: "Daft Punk",
      url: "https://last.fm/daft-punk",
      bio: { summary: "Electronic duo." },
    };

    render(<ArtistHeader artistInfo={incompleteInfo as any} />);

    expect(screen.getByText("Daft Punk")).toBeDefined();
    expect(screen.queryByText(/Listeners/)).toBeNull();
  });

  it("should handle tags object existing without nested tag array", () => {
    const malformedTags = {
      ...mockArtistInfo,
      tags: {},
    };

    render(<ArtistHeader artistInfo={malformedTags as any} />);

    expect(screen.queryByRole("listitem")).toBeNull();
    expect(screen.getByText("Radiohead")).toBeDefined();
  });

  it("should return null for ArtistTags when tag array is empty", () => {
    const emptyTagsInfo = {
      ...mockArtistInfo,
      tags: { tag: [] },
    };

    const { container } = render(
      <ArtistHeader artistInfo={emptyTagsInfo as any} />,
    );

    const tagSpan = container.querySelector(".bg-sky-900\\/20");
    expect(tagSpan).toBeNull();
  });
});
