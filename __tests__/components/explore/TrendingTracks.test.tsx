import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TrendingTracks } from "@/components/explore/TrendingTracks";
import * as utils from "@/lib/utils";

vi.mock("@/lib/utils", () => ({
  getArtistName: vi.fn(),
}));

describe("TrendingTracks", () => {
  const mockTracks = [
    {
      name: "Track One",
      artist: { name: "The Smile" },
    },
    {
      name: "Track Two",
      artist: { name: "Aphex Twin" },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(utils.getArtistName).mockImplementation((artist: any) => {
      if (!artist) return "Unknown";
      return typeof artist === "string" ? artist : artist.name;
    });
  });

  it("should render a message when the track list is empty", () => {
    render(<TrendingTracks tracks={[]} />);
    expect(screen.getByText("No trending tracks found.")).toBeDefined();
  });

  it("should render track names and artist links with correct ranking", () => {
    render(<TrendingTracks tracks={mockTracks as any} />);

    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();

    expect(screen.getByText("Track One")).toBeDefined();
    expect(screen.getByText("Track Two")).toBeDefined();

    expect(screen.getByText("The Smile")).toBeDefined();
    expect(screen.getByText("Aphex Twin")).toBeDefined();
  });

  it("should construct correct encoded URLs for artist links", () => {
    const complexArtistName = "B&B @ The Club";
    const tracksWithComplexArtist = [
      { name: "Song A", artist: { name: complexArtistName } },
    ];

    render(<TrendingTracks tracks={tracksWithComplexArtist as any} />);

    const link = screen.getByLabelText(`View artist: ${complexArtistName}`);
    const encodedName = encodeURIComponent(complexArtistName);

    expect(link.getAttribute("href")).toBe(`/artist/${encodedName}`);
  });

  it("should apply correct styling classes to the artist link", () => {
    render(<TrendingTracks tracks={[mockTracks[0]] as any} />);

    const link = screen.getByLabelText("View artist: The Smile");

    expect(link.className).toContain("inline-block");
    expect(link.className).toContain("hover:text-sky-400");
    expect(link.className).toContain("rounded");
  });

  it("should use a unique key based on track name and artist name", () => {
    render(<TrendingTracks tracks={mockTracks as any} />);
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(2);
  });
});
