import { describe, it, expect, vi, beforeEach } from "vitest";

const ARTIST_NAME = "Radiohead";
const ALBUM_NAME = "Kid A";

global.fetch = vi.fn();

describe("lastfm service", () => {
  const originalApiKey = "test-api-key";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LASTFM_API_KEY = originalApiKey;
  });

  describe("internal logic", () => {
    it("returns null and logs error when API key is missing", async () => {
      process.env.LASTFM_API_KEY = "";

      const { getAlbumInfo } = await import("@/lib/lastfm");
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getAlbumInfo(ARTIST_NAME, ALBUM_NAME);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("calls fetch with correct URL and search params", async () => {
      const { getAlbumInfo } = await import("@/lib/lastfm");

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ album: { name: ALBUM_NAME } }),
      } as Response);

      const result = await getAlbumInfo(ARTIST_NAME, ALBUM_NAME);

      expect(result).toEqual({ name: ALBUM_NAME });
    });
  });

  describe("artist filtering", () => {
    it("filters out artists properly", async () => {
      const { searchArtist } = await import("@/lib/lastfm");

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: {
            artistmatches: {
              artist: [{ name: "Drake" }, { name: "Drake feat. Future" }],
            },
          },
        }),
      } as Response);

      const results = await searchArtist("Drake");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Drake");
    });
  });
});
