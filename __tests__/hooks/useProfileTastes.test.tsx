// useProfileTastes test file
// Focuses on testing useProfileTastes hook using mocked atproto file and tastes data
// Testing scenarios such as error handling, saving tastes and handling states

import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useProfileTastes } from "@/app/hooks/useProfileTastes";
import { atApiService } from "@/lib/atproto";

vi.mock("@/lib/atproto", () => ({
  atApiService: {
    getTastes: vi.fn(),
    updateTastes: vi.fn(),
  },
}));

const mockTastes = {
  topArtists: ["Radiohead", "Aphex Twin"],
  topGenres: ["Electronic"],
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("useProfileTastes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("alert", vi.fn());
  });

  it("should do nothing if DID is not provided", () => {
    renderHook(() => useProfileTastes(undefined));
    expect(atApiService.getTastes).not.toHaveBeenCalled();
  });

  it("should fetch tastes and pad arrays", async () => {
    vi.mocked(atApiService.getTastes).mockResolvedValueOnce(mockTastes as any);

    const { result } = renderHook(() => useProfileTastes("did:plc:123"));

    expect(result.current.tastes).toBeNull();

    await waitFor(() => {
      expect(result.current.tastes).toEqual(mockTastes);
    });

    expect(result.current.editArtists).toEqual([
      "Radiohead",
      "Aphex Twin",
      "",
      "",
      "",
    ]);
    expect(result.current.editGenres).toEqual(["Electronic", "", ""]);
  });

  it("should handle empty or null values returned by getTastes gracefully", async () => {
    vi.mocked(atApiService.getTastes).mockResolvedValueOnce(null as any);
    renderHook(() => useProfileTastes("did:plc:123"));

    expect(atApiService.getTastes).toHaveBeenCalledWith("did:plc:123");
  });

  it("should handle error during fetch tastes", async () => {
    vi.mocked(atApiService.getTastes).mockRejectedValueOnce(
      new Error("API Error"),
    );
    renderHook(() => useProfileTastes("did:plc:123"));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching tastes:",
        expect.any(Error),
      );
    });
  });

  it("should handle artist, genre changes and calculate excludes", async () => {
    vi.mocked(atApiService.getTastes).mockResolvedValueOnce(mockTastes as any);

    const { result } = renderHook(() => useProfileTastes("did:plc:123"));

    await waitFor(() => {
      expect(result.current.tastes !== null).toBe(true);
    });

    act(() => {
      result.current.handleArtistChange(2, "Portishead");
      result.current.handleGenreChange(1, "Trip Hop");
    });

    expect(result.current.editArtists[2]).toBe("Portishead");
    expect(result.current.editGenres[1]).toBe("Trip Hop");

    expect(result.current.artistExcludeValues[2]).not.toContain("Portishead");
    expect(result.current.artistExcludeValues[2]).toContain("Radiohead");

    act(() => {
      result.current.cancelEditTastes();
    });

    expect(result.current.editArtists[2]).toBe("");
    expect(result.current.isEditingTastes).toBe(false);
  });

  it("should prevent saving duplicates and alert user", async () => {
    vi.mocked(atApiService.getTastes).mockResolvedValueOnce({
      topArtists: ["Artist A"],
      topGenres: [],
    } as any);

    const { result } = renderHook(() => useProfileTastes("did:plc:123"));
    await waitFor(() => {
      expect(result.current.tastes !== null).toBe(true);
    });

    act(() => {
      result.current.handleArtistChange(1, "Artist A ");
    });

    await act(async () => {
      await result.current.handleSaveTastes();
    });

    expect(window.alert).toHaveBeenCalledWith(
      "You can't enter the same artist more than once",
    );
    expect(atApiService.updateTastes).not.toHaveBeenCalled();

    act(() => {
      result.current.handleArtistChange(1, "Artist B");
      result.current.handleGenreChange(0, "genre 1");
      result.current.handleGenreChange(1, " Genre 1 ");
    });

    await act(async () => {
      await result.current.handleSaveTastes();
    });

    expect(window.alert).toHaveBeenCalledWith(
      "You can't enter the same genre more than once",
    );
    expect(atApiService.updateTastes).not.toHaveBeenCalled();
  });

  it("should save tastes successfully", async () => {
    vi.mocked(atApiService.getTastes).mockResolvedValueOnce(mockTastes as any);
    const updatedTastes = {
      ...mockTastes,
      topArtists: ["Radiohead", "Aphex Twin", "Portishead"],
    };
    vi.mocked(atApiService.getTastes).mockResolvedValueOnce(
      updatedTastes as any,
    );

    const { result } = renderHook(() => useProfileTastes("did:plc:123"));
    await waitFor(() => {
      expect(result.current.tastes !== null).toBe(true);
    });

    act(() => {
      result.current.handleArtistChange(2, "Portishead");
    });

    await act(async () => {
      await result.current.handleSaveTastes();
    });

    expect(atApiService.updateTastes).toHaveBeenCalledWith({
      topArtists: ["Radiohead", "Aphex Twin", "Portishead"],
      topGenres: ["Electronic"],
    });

    expect(result.current.isEditingTastes).toBe(false);
    expect(result.current.tastes).toEqual(updatedTastes);
  });

  it("should handle error during save", async () => {
    vi.mocked(atApiService.getTastes).mockResolvedValueOnce(mockTastes as any);
    vi.mocked(atApiService.updateTastes).mockRejectedValueOnce(
      new Error("Save Error"),
    );

    const { result } = renderHook(() => useProfileTastes("did:plc:123"));
    await waitFor(() => {
      expect(result.current.tastes !== null).toBe(true);
    });

    await act(async () => {
      await result.current.handleSaveTastes();
    });

    expect(console.error).toHaveBeenCalledWith(
      "Failed to save tastes",
      expect.any(Error),
    );
    expect(window.alert).toHaveBeenCalledWith("Failed to save tastes");
    expect(result.current.isSavingTastes).toBe(false);
  });
});
