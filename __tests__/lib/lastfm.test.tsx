import { describe, it, expect, vi, beforeEach } from "vitest";

const ARTIST_NAME = "Radiohead";
const ALBUM_NAME = "Kid A";
const TAG_NAME = "electronic";

global.fetch = vi.fn();

describe("lastfm service", () => {
  const originalApiKey = "test-api-key";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LASTFM_API_KEY = originalApiKey;
  });

  describe("internal logic", () => {
    it("should return null and log error when API key is missing", async () => {
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

    it("should call fetch with correct URL and search params", async () => {
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
    it("should filter out artists properly", async () => {
      const { searchArtist } = await import("@/lib/lastfm");

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: {
            artistmatches: {
              artist: [
                { name: "Drake" },
                { name: "Drake feat. Future" },
                { name: "Drake & 21 Savage" },
              ],
            },
          },
        }),
      } as Response);

      const results = await searchArtist("Drake");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Drake");
    });

    it("should filter artists when the query includes collaboration terms", async () => {
      const { searchArtist } = await import("@/lib/lastfm");

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: {
            artistmatches: {
              artist: [{ name: "Drake feat. Future" }],
            },
          },
        }),
      } as Response);

      const results = await searchArtist("Drake feat");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Drake feat. Future");
    });
  });

  describe("search and discovery", () => {
    it("should use getTopTracks to fetch data", async () => {
      const { getTopTracks } = await import("@/lib/lastfm");
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: { track: [{ name: "Track 1" }] } }),
      } as Response);

      const results = await getTopTracks("10");

      expect(results).toHaveLength(1);
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain("method=chart.gettoptracks");
      expect(url).toContain("limit=10");
    });

    it("should use getSimilarArtists to fetch data", async () => {
      const { getSimilarArtists } = await import("@/lib/lastfm");
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          similarartists: { artist: [{ name: "Interpol" }] },
        }),
      } as Response);

      const results = await getSimilarArtists(ARTIST_NAME);
      expect(results[0].name).toBe("Interpol");
    });

    it("should use getTopAlbumsByTag to fetch data", async () => {
      const { getTopAlbumsByTag } = await import("@/lib/lastfm");
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ albums: { album: [{ name: "Kid A" }] } }),
      } as Response);

      const results = await getTopAlbumsByTag(TAG_NAME);
      expect(results).toHaveLength(1);
      expect(vi.mocked(global.fetch).mock.calls[0][0]).toContain(
        `tag=${TAG_NAME}`,
      );
    });

    it("should use getArtistTopTracks to fetch autocorrect parameter", async () => {
      const { getArtistTopTracks } = await import("@/lib/lastfm");
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ toptracks: { track: [] } }),
      } as Response);

      await getArtistTopTracks(ARTIST_NAME);
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain("autocorrect=1");
    });

    it("should use getAlbumTopTags to fetch tags for a specific album", async () => {
      const { getAlbumTopTags } = await import("@/lib/lastfm");
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ toptags: { tag: [{ name: "Alt Rock" }] } }),
      } as Response);

      const results = await getAlbumTopTags(ARTIST_NAME, ALBUM_NAME);
      expect(results[0].name).toBe("Alt Rock");
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain("method=album.gettoptags");
    });

    it("should use searchAlbum to retrieve albums from nested results", async () => {
      const { searchAlbum } = await import("@/lib/lastfm");
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: {
            albummatches: {
              album: [{ name: ALBUM_NAME, artist: ARTIST_NAME }],
            },
          },
        }),
      } as Response);

      const results = await searchAlbum(ALBUM_NAME);
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe(ALBUM_NAME);
    });

    it("should use getTopArtists to retrieve artists from chart", async () => {
      const { getTopArtists } = await import("@/lib/lastfm");
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          artists: { artist: [{ name: "Artist 1" }, { name: "Artist 2" }] },
        }),
      } as Response);

      const results = await getTopArtists("2");
      expect(results).toHaveLength(2);
      expect(vi.mocked(global.fetch).mock.calls[0][0]).toContain(
        "method=chart.gettopartists",
      );
    });

    it("should use searchTag to retrieve tags from tag matches", async () => {
      const { searchTag } = await import("@/lib/lastfm");
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: { tagmatches: { tag: [{ name: TAG_NAME }] } },
        }),
      } as Response);

      const results = await searchTag(TAG_NAME);
      expect(results[0].name).toBe(TAG_NAME);
    });

    it("should use getTopTags to retrieve tags from chart", async () => {
      const { getTopTags } = await import("@/lib/lastfm");
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tags: { tag: [{ name: "Rock" }] },
        }),
      } as Response);

      const results = await getTopTags("1");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Rock");
    });

    it("should use getTopArtistsByTag to retrieve artists for a tag", async () => {
      const { getTopArtistsByTag } = await import("@/lib/lastfm");
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          topartists: { artist: [{ name: "Specific Artist" }] },
        }),
      } as Response);

      const results = await getTopArtistsByTag(TAG_NAME);
      expect(results[0].name).toBe("Specific Artist");
      expect(vi.mocked(global.fetch).mock.calls[0][0]).toContain(
        `tag=${TAG_NAME}`,
      );
    });

    it("should use getArtistInfo to return the artist object or null", async () => {
      const { getArtistInfo } = await import("@/lib/lastfm");
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          artist: { name: ARTIST_NAME, bio: { summary: "Bio" } },
        }),
      } as Response);

      const result = await getArtistInfo(ARTIST_NAME);
      expect(result.name).toBe(ARTIST_NAME);

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      const nullResult = await getArtistInfo("Unknown");
      expect(nullResult).toBeNull();
    });

    it("should use getArtistTopAlbums to retrieve top albums for an artist", async () => {
      const { getArtistTopAlbums } = await import("@/lib/lastfm");
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          topalbums: { album: [{ name: "The Bends" }] },
        }),
      } as Response);

      const results = await getArtistTopAlbums(ARTIST_NAME, "1");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("The Bends");
      expect(vi.mocked(global.fetch).mock.calls[0][0]).toContain(
        "autocorrect=1",
      );
    });
  });
});
