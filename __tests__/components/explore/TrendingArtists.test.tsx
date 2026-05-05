// TrendingArtists test file
// Focuses on testing TrendingArtists component using mocking utils file and API responses
// Tests scenarios such as rendering content, encoding URLs and handling truncation

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TrendingArtists } from "@/components/explore/TrendingArtists";
import * as utils from "@/lib/utils";

vi.mock("@/lib/utils", () => ({
  getArtistName: vi.fn(),
}));

describe("TrendingArtists", () => {
  const mockArtists = [{ name: "The Smile" }, { name: "Aphex Twin" }];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(utils.getArtistName).mockImplementation((artist: any) => {
      if (!artist) return "Unknown";
      return typeof artist === "string" ? artist : artist.name;
    });
  });

  it("should render a message when the artist list is empty", () => {
    render(<TrendingArtists artists={[]} />);
    expect(screen.getByText("No trending artists found.")).toBeDefined();
  });

  it("should render a list of artists with correct ranking numbers", () => {
    render(<TrendingArtists artists={mockArtists as any} />);

    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("The Smile")).toBeDefined();
    expect(screen.getByText("Aphex Twin")).toBeDefined();
  });

  it("should construct correct encoded URLs for navigation", () => {
    const complexName = "B&B @ The Club";
    const complexArtist = [{ name: complexName }];

    render(<TrendingArtists artists={complexArtist as any} />);

    const link = screen.getByRole("link", {
      name: new RegExp(complexName, "i"),
    });
    const encodedName = encodeURIComponent(complexName);

    expect(link.getAttribute("href")).toBe(`/artist/${encodedName}`);
  });

  it("should handle truncation classes on the artist link", () => {
    render(<TrendingArtists artists={[mockArtists[0]] as any} />);
    const link = screen.getByRole("link", { name: /The Smile/i });
    expect(link.className).toContain("truncate");
  });
});
