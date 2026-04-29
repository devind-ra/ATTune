import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useArtistData } from "@/app/hooks/useArtistData";
import {
  getArtistInfo,
  getArtistTopTracks,
  getArtistTopAlbums,
} from "@/lib/lastfm";

vi.mock("@/lib/lastfm", () => ({
  getArtistInfo: vi.fn(),
  getArtistTopTracks: vi.fn(),
  getArtistTopAlbums: vi.fn(),
}));

describe("useArtistData", () => {
  const mockArtistName = "Radiohead";

  const mockInfo = { name: "Radiohead", bio: { summary: "Legendary band" } };
  const mockTracks = [{ name: "Creep" }, { name: "Karma Police" }];
  const mockAlbums = [{ name: "OK Computer" }, { name: "Kid A" }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialise with loading state and empty data", () => {
    const { result } = renderHook(() => useArtistData(mockArtistName));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.artistInfo).toBeNull();
    expect(result.current.topTracks).toEqual([]);
    expect(result.current.topAlbums).toEqual([]);
  });

  it("should fetch and return data successfully", async () => {
    vi.mocked(getArtistInfo).mockResolvedValue(mockInfo as any);
    vi.mocked(getArtistTopTracks).mockResolvedValue(mockTracks as any);
    vi.mocked(getArtistTopAlbums).mockResolvedValue(mockAlbums as any);

    const { result } = renderHook(() => useArtistData(mockArtistName));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.artistInfo).toEqual(mockInfo);
    expect(result.current.topTracks).toEqual(mockTracks);
    expect(result.current.topAlbums).toEqual(mockAlbums);

    expect(getArtistInfo).toHaveBeenCalledWith(mockArtistName);
  });

  it("should handle API errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getArtistInfo).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useArtistData(mockArtistName));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isLoading).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to load artist data",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("should not fetch data if artistName is empty", () => {
    renderHook(() => useArtistData(""));

    expect(getArtistInfo).not.toHaveBeenCalled();
  });
});
