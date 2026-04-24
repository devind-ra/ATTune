import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useExploreData } from "@/app/hooks/useExploreData";
import { atApiService } from "@/lib/atproto";
import {
  getTopTags,
  getTopTracks,
  getTopArtists,
  getTopAlbumsByTag,
} from "@/lib/lastfm";
import { shuffle } from "@/lib/utils";

interface UserSession {
  did: string;
}

interface AuthContextType {
  session: UserSession | null;
  isLoading: boolean;
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
}));

const routerPushMock = vi.fn();

const contextMock: AuthContextType = {
  session: { did: "did:plc:123" },
  isLoading: false,
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => contextMock,
}));

vi.mock("@/lib/atproto", () => ({
  atApiService: {
    getTastes: vi.fn(),
  },
}));

vi.mock("@/lib/lastfm", () => ({
  getTopTags: vi.fn(),
  getTopTracks: vi.fn(),
  getTopArtists: vi.fn(),
  getTopAlbumsByTag: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
  shuffle: vi.fn((arr) => arr),
}));

const mockTastes = {
  topArtists: [],
  topGenres: ["Rock", "Pop"],
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockTags = [
  { name: "Rock" },
  { name: "Pop" },
  { name: "Jazz" },
  { name: "Blues" },
  { name: "Classical" },
  { name: "Electronic" },
];

const mockTracks = [
  { name: "Track 1", artist: { name: "Artist 1" } },
  { name: "Track 2", artist: { name: "Artist 2" } },
];

const mockArtists = [
  { name: "Artist 1", listeners: "1000000" },
  { name: "Artist 2", listeners: "900000" },
];

const mockAlbums = [
  { name: "Album 1", artist: { name: "Artist 1" }, image: [] },
  { name: "Album 2", artist: { name: "Artist 2" }, image: [] },
];

describe("useExploreData hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    contextMock.session = { did: "did:plc:123" };
    contextMock.isLoading = false;
    vi.mocked(shuffle).mockImplementation((arr) => arr);
  });

  describe("auth redirect", () => {
    it("should redirect to / when not loading and no session", async () => {
      contextMock.session = null;
      contextMock.isLoading = false;

      renderHook(() => useExploreData());

      await waitFor(() => {
        expect(routerPushMock).toHaveBeenCalledWith("/");
      });
    });

    it("should not redirect when session exists", async () => {
      vi.mocked(atApiService.getTastes).mockResolvedValueOnce(null);
      vi.mocked(getTopTags).mockResolvedValueOnce([]);
      vi.mocked(getTopTracks).mockResolvedValueOnce([]);
      vi.mocked(getTopArtists).mockResolvedValueOnce([]);

      renderHook(() => useExploreData());

      await waitFor(() => expect(atApiService.getTastes).toHaveBeenCalled());

      expect(routerPushMock).not.toHaveBeenCalled();
    });

    it("should not redirect while still loading", () => {
      contextMock.session = null;
      contextMock.isLoading = true;

      renderHook(() => useExploreData());

      expect(routerPushMock).not.toHaveBeenCalled();
    });
  });

  describe("isReady", () => {
    it("should be false when isLoading is true", () => {
      contextMock.isLoading = true;

      const { result } = renderHook(() => useExploreData());

      expect(result.current.isReady).toBe(false);
    });

    it("should be false when session is null", () => {
      contextMock.session = null;

      const { result } = renderHook(() => useExploreData());

      expect(result.current.isReady).toBe(false);
    });

    it("should be true when session exists and not loading", () => {
      const { result } = renderHook(() => useExploreData());

      expect(result.current.isReady).toBe(true);
    });
  });

  describe("loading explore data", () => {
    it("should fetch tastes, tags, tracks, and artists concurrently", async () => {
      vi.mocked(atApiService.getTastes).mockResolvedValueOnce(null);
      vi.mocked(getTopTags).mockResolvedValueOnce([]);
      vi.mocked(getTopTracks).mockResolvedValueOnce([]);
      vi.mocked(getTopArtists).mockResolvedValueOnce([]);

      renderHook(() => useExploreData());

      await waitFor(() => {
        expect(atApiService.getTastes).toHaveBeenCalledWith("did:plc:123");
        expect(getTopTags).toHaveBeenCalledWith("50");
        expect(getTopTracks).toHaveBeenCalledWith("10");
        expect(getTopArtists).toHaveBeenCalledWith("10");
      });
    });

    it("should filter tags, fetch albums, and set data completely", async () => {
      vi.mocked(atApiService.getTastes).mockResolvedValueOnce(mockTastes);
      vi.mocked(getTopTags).mockResolvedValueOnce(mockTags as any);
      vi.mocked(getTopTracks).mockResolvedValueOnce(mockTracks as any);
      vi.mocked(getTopArtists).mockResolvedValueOnce(mockArtists as any);
      vi.mocked(getTopAlbumsByTag).mockResolvedValue(mockAlbums as any);

      const { result } = renderHook(() => useExploreData());

      await waitFor(() => {
        expect(result.current.topTracks).toEqual(mockTracks);
      });

      expect(getTopAlbumsByTag).toHaveBeenCalledWith("Jazz", "20");
      expect(getTopAlbumsByTag).toHaveBeenCalledWith("Blues", "20");
      expect(getTopAlbumsByTag).toHaveBeenCalledWith("Classical", "20");
      expect(getTopAlbumsByTag).not.toHaveBeenCalledWith("Rock", "20");
      expect(getTopAlbumsByTag).not.toHaveBeenCalledWith("Pop", "20");
      expect(getTopAlbumsByTag).not.toHaveBeenCalledWith("Electronic", "20");

      expect(result.current.topArtists).toEqual(mockArtists);
      expect(result.current.discoveryData).toEqual([
        { tag: { name: "Jazz" }, albums: mockAlbums },
        { tag: { name: "Blues" }, albums: mockAlbums },
        { tag: { name: "Classical" }, albums: mockAlbums },
      ]);
    });

    it("should set topArtists from getTopArtists result", async () => {
      vi.mocked(atApiService.getTastes).mockResolvedValueOnce(null);
      vi.mocked(getTopTags).mockResolvedValueOnce([]);
      vi.mocked(getTopTracks).mockResolvedValueOnce([]);
      vi.mocked(getTopArtists).mockResolvedValueOnce(mockArtists as any);

      const { result } = renderHook(() => useExploreData());

      await waitFor(() => {
        expect(result.current.topArtists).toEqual(mockArtists);
      });
    });

    it("should handle tastes gracefully when it's null", async () => {
      vi.mocked(atApiService.getTastes).mockResolvedValueOnce(null);
      vi.mocked(getTopTags).mockResolvedValueOnce(mockTags as any);
      vi.mocked(getTopTracks).mockResolvedValueOnce(mockTracks as any);
      vi.mocked(getTopArtists).mockResolvedValueOnce([]);
      vi.mocked(getTopAlbumsByTag).mockResolvedValue(mockAlbums as any);

      renderHook(() => useExploreData());

      await waitFor(() => {
        expect(getTopAlbumsByTag).toHaveBeenCalledWith("Rock", "20");
        expect(getTopAlbumsByTag).toHaveBeenCalledWith("Pop", "20");
        expect(getTopAlbumsByTag).toHaveBeenCalledWith("Jazz", "20");
      });
    });

    it("should initialise topArtists as an empty array", () => {
      const { result } = renderHook(() => useExploreData());

      expect(result.current.topArtists).toEqual([]);
    });
  });

  describe("error handling", () => {
    it("should log error when loadData throws", async () => {
      vi.mocked(atApiService.getTastes).mockRejectedValueOnce(
        new Error("API explore error"),
      );
      vi.mocked(getTopTags).mockResolvedValueOnce([]);
      vi.mocked(getTopTracks).mockResolvedValueOnce([]);
      vi.mocked(getTopArtists).mockResolvedValueOnce([]);

      renderHook(() => useExploreData());

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(expect.any(Error));
      });
    });
  });
});
