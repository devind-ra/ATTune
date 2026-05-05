// useAlbumPage test file
// Focuses on testing useAlbumPage hook using mocked lastfm album info and tags
// Testing scenarios such as handling states, error handling and successful fetches

import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAlbumPage } from "@/app/hooks/useAlbumPage";
import { getAlbumInfo, getAlbumTopTags } from "@/lib/lastfm";

vi.mock("@/lib/lastfm", () => ({
  getAlbumInfo: vi.fn(),
  getAlbumTopTags: vi.fn(),
}));

const mockAlbumInfo = {
  name: "OK Computer",
  artist: "Radiohead",
  image: [],
  tracks: { track: [] },
  wiki: { published: "1997", summary: "A summary", content: "Content" },
};

const mockTags = [
  { name: "alternative", url: "" },
  { name: "rock", url: "" },
];

describe("useAlbumPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialise with default state", () => {
    const { result } = renderHook(() => useAlbumPage("", ""));

    expect(result.current.albumInfo).toBeUndefined();
    expect(result.current.tags).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("should not fetch if artistName or albumName is empty", async () => {
    renderHook(() => useAlbumPage(mockAlbumInfo.artist, ""));
    renderHook(() => useAlbumPage("", mockAlbumInfo.name));

    expect(getAlbumInfo).not.toHaveBeenCalled();
    expect(getAlbumTopTags).not.toHaveBeenCalled();
  });

  it("should fetch album info and tags successfully", async () => {
    vi.mocked(getAlbumInfo).mockResolvedValueOnce(mockAlbumInfo);
    vi.mocked(getAlbumTopTags).mockResolvedValueOnce(mockTags);

    const { result } = renderHook(() =>
      useAlbumPage(mockAlbumInfo.artist, mockAlbumInfo.name),
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getAlbumInfo).toHaveBeenCalledWith(
      mockAlbumInfo.artist,
      mockAlbumInfo.name,
    );
    expect(getAlbumTopTags).toHaveBeenCalledWith(
      mockAlbumInfo.artist,
      mockAlbumInfo.name,
    );

    expect(result.current.albumInfo).toEqual(mockAlbumInfo);
    expect(result.current.tags).toEqual(mockTags);
  });

  it("should handle errors during fetch gracefully", async () => {
    const error = new Error("API failure");
    vi.mocked(getAlbumInfo).mockRejectedValueOnce(error);
    vi.mocked(getAlbumTopTags).mockRejectedValueOnce(error);

    const { result } = renderHook(() =>
      useAlbumPage(mockAlbumInfo.artist, mockAlbumInfo.name),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(console.error).toHaveBeenCalledWith(
      "Failed to load album data",
      error,
    );
    expect(result.current.albumInfo).toBeUndefined();
    expect(result.current.tags).toEqual([]);
  });
});
