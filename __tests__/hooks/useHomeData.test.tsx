import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useHomeData } from "@/app/hooks/useHomeData";
import { atApiService } from "@/lib/atproto";
import {
  getSimilarArtists,
  getTopAlbumsByTag,
  getTopArtists,
} from "@/lib/lastfm";
import { getArtistName, shuffle } from "@/lib/utils";

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
  getSimilarArtists: vi.fn(),
  getTopAlbumsByTag: vi.fn(),
  getTopArtists: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
  getArtistName: vi.fn(),
  shuffle: vi.fn((arr) => arr),
}));

const mockTastes = {
  topArtists: ["Radiohead", "Aphex Twin"],
  topGenres: ["Electronic", "Ambient"],
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockSimilarArtists = [
  { name: "Portishead", listeners: "500000" },
  { name: "Massive Attack", listeners: "600000" },
];

const mockAlbums = [
  { name: "Dummy", artist: { name: "Portishead" }, image: [] },
  { name: "Blue Lines", artist: { name: "Massive Attack" }, image: [] },
];

const mockTopArtists = [
  { name: "Taylor Swift", listeners: "9000000" },
  { name: "Drake", listeners: "8000000" },
];

describe("useHomeData hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    contextMock.session = { did: "did:plc:123" };
    contextMock.isLoading = false;
    vi.mocked(shuffle).mockImplementation((arr) => arr);
    vi.mocked(getArtistName).mockImplementation((artist) =>
      typeof artist === "string" ? artist : (artist?.name ?? ""),
    );
  });

  describe("auth redirect", () => {
    it("should redirect to / when not loading and no session", async () => {
      contextMock.session = null;
      contextMock.isLoading = false;

      renderHook(() => useHomeData());

      await waitFor(() => {
        expect(routerPushMock).toHaveBeenCalledWith("/");
      });
    });

    it("should not redirect when session exists", async () => {
      vi.mocked(atApiService.getTastes).mockResolvedValueOnce(null);
      vi.mocked(getTopArtists).mockResolvedValueOnce([]);

      renderHook(() => useHomeData());

      await waitFor(() => expect(atApiService.getTastes).toHaveBeenCalled());

      expect(routerPushMock).not.toHaveBeenCalled();
    });

    it("should not redirect while still loading", () => {
      contextMock.session = null;
      contextMock.isLoading = true;

      renderHook(() => useHomeData());

      expect(routerPushMock).not.toHaveBeenCalled();
    });
  });

  describe("isReady", () => {
    it("should be false when isLoading is true", () => {
      contextMock.isLoading = true;

      const { result } = renderHook(() => useHomeData());

      expect(result.current.isReady).toBe(false);
    });

    it("should be false when session is null", () => {
      contextMock.session = null;

      const { result } = renderHook(() => useHomeData());

      expect(result.current.isReady).toBe(false);
    });

    it("should be true when session exists and not loading", () => {
      const { result } = renderHook(() => useHomeData());

      expect(result.current.isReady).toBe(true);
    });
  });

  describe("loading recommendations", () => {
    it("should call getTastes with the session did", async () => {
      vi.mocked(atApiService.getTastes).mockResolvedValueOnce(null);
      vi.mocked(getTopArtists).mockResolvedValueOnce([]);

      renderHook(() => useHomeData());

      await waitFor(() => {
        expect(atApiService.getTastes).toHaveBeenCalledWith("did:plc:123");
      });
    });

    it("should do nothing further when tastes is null", async () => {
      vi.mocked(atApiService.getTastes).mockResolvedValueOnce(null);
      vi.mocked(getTopArtists).mockResolvedValueOnce([]);

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => expect(getTopArtists).toHaveBeenCalled());

      expect(result.current.recommendedArtists).toEqual([]);
      expect(result.current.recommendedAlbums).toEqual([]);
    });

    it("should call getSimilarArtists for each top artist in tastes", async () => {
      vi.mocked(atApiService.getTastes).mockResolvedValueOnce(mockTastes);
      vi.mocked(getSimilarArtists).mockResolvedValue(mockSimilarArtists);
      vi.mocked(getTopAlbumsByTag).mockResolvedValue(mockAlbums);
      vi.mocked(getTopArtists).mockResolvedValueOnce([]);

      renderHook(() => useHomeData());

      await waitFor(() => {
        expect(getSimilarArtists).toHaveBeenCalledWith("Radiohead", "5");
        expect(getSimilarArtists).toHaveBeenCalledWith("Aphex Twin", "5");
      });
    });

    it("should call getTopAlbumsByTag for each genre in tastes", async () => {
      vi.mocked(atApiService.getTastes).mockResolvedValueOnce(mockTastes);
      vi.mocked(getSimilarArtists).mockResolvedValue([]);
      vi.mocked(getTopAlbumsByTag).mockResolvedValue(mockAlbums);
      vi.mocked(getTopArtists).mockResolvedValueOnce([]);

      renderHook(() => useHomeData());

      await waitFor(() => {
        expect(getTopAlbumsByTag).toHaveBeenCalledWith("Electronic", "5");
        expect(getTopAlbumsByTag).toHaveBeenCalledWith("Ambient", "5");
      });
    });

    it("should deduplicate and slice recommended artists to 5", async () => {
      const manyArtists = Array.from({ length: 8 }, (_, i) => ({
        name: `Artist ${i}`,
        listeners: "100",
      }));

      vi.mocked(atApiService.getTastes).mockResolvedValueOnce(mockTastes);
      vi.mocked(getSimilarArtists).mockResolvedValue(manyArtists);
      vi.mocked(getTopAlbumsByTag).mockResolvedValue([]);
      vi.mocked(getTopArtists).mockResolvedValueOnce([]);

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.recommendedArtists).toHaveLength(5);
      });
    });

    it("should deduplicate and slice recommended albums to 5", async () => {
      const manyAlbums = Array.from({ length: 8 }, (_, i) => ({
        name: `Album ${i}`,
        artist: { name: "Artist" },
        image: [],
      }));

      vi.mocked(atApiService.getTastes).mockResolvedValueOnce(mockTastes);
      vi.mocked(getSimilarArtists).mockResolvedValue([]);
      vi.mocked(getTopAlbumsByTag).mockResolvedValue(manyAlbums);
      vi.mocked(getTopArtists).mockResolvedValueOnce([]);

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.recommendedAlbums).toHaveLength(5);
      });
    });

    it("should remove duplicate artists by name", async () => {
      const dupeArtists = [
        { name: "Radiohead", listeners: "100" },
        { name: "Radiohead", listeners: "100" },
        { name: "Portishead", listeners: "200" },
      ];

      vi.mocked(atApiService.getTastes).mockResolvedValueOnce({
        ...mockTastes,
        topArtists: ["Radiohead"],
      });
      vi.mocked(getSimilarArtists).mockResolvedValueOnce(dupeArtists);
      vi.mocked(getTopAlbumsByTag).mockResolvedValue([]);
      vi.mocked(getTopArtists).mockResolvedValueOnce([]);

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        const names = result.current.recommendedArtists.map((a) => a.name);
        expect(names).toEqual(["Radiohead", "Portishead"]);
      });
    });

    it("should remove duplicate albums by name + artist", async () => {
      vi.mocked(getArtistName).mockReturnValue("Portishead");

      const dupeAlbums = [
        { name: "Dummy", artist: { name: "Portishead" }, image: [] },
        { name: "Dummy", artist: { name: "Portishead" }, image: [] },
        { name: "Blue Lines", artist: { name: "Massive Attack" }, image: [] },
      ];

      vi.mocked(atApiService.getTastes).mockResolvedValueOnce({
        ...mockTastes,
        topGenres: ["Electronic"],
      });
      vi.mocked(getSimilarArtists).mockResolvedValue([]);
      vi.mocked(getTopAlbumsByTag).mockResolvedValueOnce(dupeAlbums);
      vi.mocked(getTopArtists).mockResolvedValueOnce([]);

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        const names = result.current.recommendedAlbums.map((a) => a.name);
        expect(names).toEqual(["Dummy", "Blue Lines"]);
      });
    });
  });

  describe("top artists", () => {
    it("should populate topArtists from getTopArtists", async () => {
      vi.mocked(atApiService.getTastes).mockResolvedValue(null);
      vi.mocked(getTopArtists).mockResolvedValue(mockTopArtists);

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.topArtists).toEqual(mockTopArtists);
      });
    });
  });

  describe("error handling", () => {
    it("should log error when loadData throws", async () => {
      vi.mocked(atApiService.getTastes).mockRejectedValueOnce(
        new Error("API error"),
      );

      renderHook(() => useHomeData());

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(expect.any(Error));
      });
    });
  });
});
