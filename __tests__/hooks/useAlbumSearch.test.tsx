import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAlbumSearch } from "@/app/hooks/useAlbumSearch";
import { LastFMAlbum, searchAlbum } from "@/lib/lastfm";

vi.mock("@/lib/lastfm", () => ({
  searchAlbum: vi.fn(),
}));

const mockAlbums = [
  { name: "OK Computer", artist: { name: "Radiohead" }, image: [] },
  { name: "Kid A", artist: { name: "Radiohead" }, image: [] },
  { name: "Amnesiac", artist: { name: "Radiohead" }, image: [] },
];

describe("useAlbumSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialise with empty state", () => {
    const { result } = renderHook(() => useAlbumSearch());

    expect(result.current.searchQuery).toBe("");
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it("should not search when query is 2 characters or fewer", async () => {
    const { result } = renderHook(() => useAlbumSearch());

    act(() => {
      result.current.setSearchQuery("ok");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(searchAlbum).not.toHaveBeenCalled();
    expect(result.current.searchResults).toEqual([]);
  });

  it("should not search when query is only whitespace", async () => {
    const { result } = renderHook(() => useAlbumSearch());

    act(() => {
      result.current.setSearchQuery("   ");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(searchAlbum).not.toHaveBeenCalled();
  });

  it("should search after 500ms debounce with query longer than 2 chars", async () => {
    vi.mocked(searchAlbum).mockResolvedValueOnce(mockAlbums);

    const { result } = renderHook(() => useAlbumSearch());

    act(() => {
      result.current.setSearchQuery("radiohead");
    });

    expect(searchAlbum).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(searchAlbum).toHaveBeenCalledWith("radiohead");
  });

  it("should not fire search before the debounce delay elapses", async () => {
    const { result } = renderHook(() => useAlbumSearch());

    act(() => {
      result.current.setSearchQuery("radiohead");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(499);
    });

    expect(searchAlbum).not.toHaveBeenCalled();
  });

  it("should cancel the previous timer when query changes before debounce fires", async () => {
    vi.mocked(searchAlbum).mockResolvedValueOnce(mockAlbums);

    const { result } = renderHook(() => useAlbumSearch());

    act(() => {
      result.current.setSearchQuery("radio");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    act(() => {
      result.current.setSearchQuery("radiohead");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(searchAlbum).toHaveBeenCalledTimes(1);
    expect(searchAlbum).toHaveBeenCalledWith("radiohead");
  });

  it("should populate searchResults on success", async () => {
    vi.mocked(searchAlbum).mockResolvedValueOnce(mockAlbums);

    const { result } = renderHook(() => useAlbumSearch());

    act(() => {
      result.current.setSearchQuery("radiohead");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    await waitFor(() => {
      expect(result.current.searchResults).toEqual(mockAlbums);
    });
  });

  it("should slice results to a maximum of 5", async () => {
    const manyAlbums = Array.from({ length: 8 }, (_, i) => ({
      name: `Album ${i}`,
      artist: { name: "Artist" },
      image: [],
    }));

    vi.mocked(searchAlbum).mockResolvedValueOnce(manyAlbums);

    const { result } = renderHook(() => useAlbumSearch());

    act(() => {
      result.current.setSearchQuery("radiohead");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    await waitFor(() => {
      expect(result.current.searchResults).toHaveLength(5);
    });
  });

  it("should set results to empty array when response is not an array", async () => {
    vi.mocked(searchAlbum).mockResolvedValueOnce({
      name: "OK Computer",
    } as unknown as LastFMAlbum[]);

    const { result } = renderHook(() => useAlbumSearch());

    act(() => {
      result.current.setSearchQuery("radiohead");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    await waitFor(() => {
      expect(result.current.searchResults).toEqual([]);
    });
  });

  it("should log error and stop searching when searchAlbum rejects", async () => {
    vi.mocked(searchAlbum).mockRejectedValueOnce(new Error("API error"));

    const { result } = renderHook(() => useAlbumSearch());

    act(() => {
      result.current.setSearchQuery("radiohead");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Search failed:",
        expect.any(Error),
      );
    });

    expect(result.current.isSearching).toBe(false);
  });

  it("should clear results when query drops to 2 characters or fewer", async () => {
    vi.mocked(searchAlbum).mockResolvedValueOnce(mockAlbums);

    const { result } = renderHook(() => useAlbumSearch());

    act(() => result.current.setSearchQuery("radiohead"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    await waitFor(() => expect(result.current.searchResults).toHaveLength(3));

    act(() => result.current.setSearchQuery("ra"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(result.current.searchResults).toEqual([]);
  });

  it("should reset query and results", async () => {
    vi.mocked(searchAlbum).mockResolvedValueOnce(mockAlbums);

    const { result } = renderHook(() => useAlbumSearch());

    act(() => result.current.setSearchQuery("radiohead"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    await waitFor(() => expect(result.current.searchResults).toHaveLength(3));

    act(() => result.current.clearSearch());

    expect(result.current.searchQuery).toBe("");
    expect(result.current.searchResults).toEqual([]);
  });
});
