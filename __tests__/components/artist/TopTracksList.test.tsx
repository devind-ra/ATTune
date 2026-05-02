import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TopTracksList } from "@/components/artist/TopTracksList";
import { getArtistName } from "@/lib/utils";

vi.mock("@/lib/utils", () => ({
  getArtistName: vi.fn(),
}));

describe("TopTracksList", () => {
  const mockTracks = [
    { name: "Smells Like Teen Spirit", artist: { name: "Nirvana" } },
    { name: "Come As You Are", artist: "Nirvana" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getArtistName).mockImplementation((artist: any) =>
      typeof artist === "string" ? artist : artist.name,
    );
  });

  it("should render the list of tracks with correct rank numbers", () => {
    render(<TopTracksList tracks={mockTracks as any} />);

    expect(screen.getByText("Top Tracks")).toBeDefined();

    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();

    expect(screen.getByText("Smells Like Teen Spirit")).toBeDefined();
    expect(screen.getByText("Come As You Are")).toBeDefined();
  });

  it("should call getArtistName for each track to display the artist", () => {
    render(<TopTracksList tracks={mockTracks as any} />);

    expect(getArtistName).toHaveBeenCalledTimes(2);
    expect(screen.getAllByText("Nirvana")).toHaveLength(2);
  });

  it("should return null and render nothing if the tracks array is empty", () => {
    const { container } = render(<TopTracksList tracks={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("should apply truncate classes for long text handling", () => {
    const longTrack = [
      {
        name: "A very long track name that should definitely be truncated in the UI",
        artist: "A very long artist name",
      },
    ];

    const { container } = render(<TopTracksList tracks={longTrack as any} />);

    const trackName = container.querySelector("p.truncate");
    expect(trackName).toBeDefined();
    expect(trackName?.className).toContain("truncate");
  });

  it("should use a list and list items for accessibility", () => {
    render(<TopTracksList tracks={mockTracks as any} />);

    expect(screen.getByRole("list")).toBeDefined();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
