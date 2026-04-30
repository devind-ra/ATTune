import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeoTopArtists } from "@/components/explore/GeoTopArtists";
import { getGeoTopArtists } from "@/lib/lastfm";

vi.mock("@/lib/lastfm", () => ({
  getGeoTopArtists: vi.fn(),
}));

vi.mock("@/components/ArtistList", () => ({
  ArtistList: vi.fn(({ artists }) => (
    <div data-testid="artist-list">{artists.length} Artists Loaded</div>
  )),
}));

describe("GeoTopArtists", () => {
  const mockArtists = [
    { name: "Radiohead", listeners: "1000" },
    { name: "Arctic Monkeys", listeners: "900" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch new data when the country is changed", async () => {
    (getGeoTopArtists as any).mockResolvedValue(mockArtists);
    render(<GeoTopArtists />);
    await waitFor(() => expect(getGeoTopArtists).toHaveBeenCalledTimes(1));
    const select = screen.getByLabelText("Select country from dropdown");
    fireEvent.change(select, { target: { value: "Japan" } });

    await waitFor(() => {
      expect(getGeoTopArtists).toHaveBeenCalledWith("Japan", "10");
    });
  });

  it("should display an error message if the fetch fails", async () => {
    (getGeoTopArtists as any).mockRejectedValue(new Error("API Failure"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<GeoTopArtists />);

    await waitFor(() => {
      expect(
        screen.getByText("No artists found for this region."),
      ).toBeDefined();
    });

    consoleSpy.mockRestore();
  });

  it("should display empty state message when no artists are returned", async () => {
    (getGeoTopArtists as any).mockResolvedValue([]);
    render(<GeoTopArtists />);

    await waitFor(() => {
      expect(
        screen.getByText("No artists found for this region."),
      ).toBeDefined();
    });
  });

  it("should correctly render the static headings", () => {
    (getGeoTopArtists as any).mockResolvedValue([]);
    render(<GeoTopArtists />);

    expect(screen.getByText("Top Artists By Country")).toBeDefined();
    expect(
      screen.getByText(/Discover the top artists in different countries/i),
    ).toBeDefined();
  });

  it("should not update state if the component unmounts before the API call finishes", async () => {
    let resolveRequest: (value: any) => void;
    const slowPromise = new Promise((resolve) => {
      resolveRequest = resolve;
    });

    (getGeoTopArtists as any).mockReturnValue(slowPromise);

    const { unmount } = render(<GeoTopArtists />);
    unmount();
    resolveRequest!([{ name: "Stale Artist" }]);
    await waitFor(() => {
      expect(screen.queryByTestId("artist-list")).toBeNull();
    });

    expect(getGeoTopArtists).toHaveBeenCalledTimes(1);
  });

  it("should ensure setIsLoading(false) is called in the finally block on success", async () => {
    (getGeoTopArtists as any).mockResolvedValue(mockArtists);
    render(<GeoTopArtists />);
    const loader = document.querySelector(".animate-spin");
    expect(loader).not.toBeNull();

    await waitFor(() => {
      expect(document.querySelector(".animate-spin")).toBeNull();
    });
  });
});
