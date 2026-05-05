// AlbumTags test file
// Focuses on testing the AlbumTags component using mocked API responses
// Tests for scenario such as rendering content and styling

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AlbumTags } from "@/components/album/AlbumTags";
import { LastFMTag } from "@/lib/lastfm";

describe("AlbumTags", () => {
  const mockTags: LastFMTag[] = [
    { name: "Rock", url: "" },
    { name: "Progressive Rock", url: "" },
    { name: "70s", url: "" },
    { name: "Classic Rock", url: "" },
  ];

  it("should render the tags correctly", () => {
    render(<AlbumTags tags={mockTags} />);

    mockTags.forEach((tag) => {
      expect(screen.getByText(tag.name)).toBeDefined();
    });
  });

  it("should return null and render nothing when the tags array is empty", () => {
    const { container } = render(<AlbumTags tags={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("should limit the display to exactly 8 tags even if more are provided", () => {
    const manyTags: LastFMTag[] = Array.from({ length: 15 }, (_, i) => ({
      name: `Tag ${i}`,
      url: "",
    }));

    render(<AlbumTags tags={manyTags} />);

    const tagElements = screen.getAllByText(/Tag \d+/);
    expect(tagElements).toHaveLength(8);

    expect(screen.getByText("Tag 0")).toBeDefined();
    expect(screen.getByText("Tag 7")).toBeDefined();
    expect(screen.queryByText("Tag 8")).toBeNull();
  });

  it("should apply the correct styling classes to the tags", () => {
    render(<AlbumTags tags={[mockTags[0]]} />);

    const tag = screen.getByText("Rock");

    expect(tag.className).toContain("bg-sky-900/20");
    expect(tag.className).toContain("rounded-full");
    expect(tag.className).toContain("text-sky-400");
  });
});
