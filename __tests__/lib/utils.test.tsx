import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  shuffle,
  parseImage,
  parseReleaseDate,
  cleanWiki,
  getArtistName,
  getImageUrl,
  padArray,
  hasDuplicates,
  compareReviews,
} from "@/lib/utils";
import { LastFMImage } from "@/lib/lastfm";

describe("utils", () => {
  describe("shuffle", () => {
    let originalCrypto: Crypto;

    beforeEach(() => {
      originalCrypto = global.crypto;
      Object.defineProperty(global, "crypto", {
        value: {
          getRandomValues: (arr: Uint32Array | Int32Array | Uint8Array) => {
            arr[0] = 0;
            return arr;
          },
        },
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(global, "crypto", {
        value: originalCrypto,
        writable: true,
        configurable: true,
      });
    });

    it("should return a different array reference", () => {
      const arr = [1, 2, 3];
      const result = shuffle(arr);
      expect(result).not.toBe(arr);
    });

    it("should contain all original elements", () => {
      const arr = [1, 2, 3];
      const result = shuffle(arr);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
      expect(result).toHaveLength(3);
    });
  });

  describe("parseImage", () => {
    it("should return the extralarge image if available", () => {
      const images: LastFMImage[] = [
        { size: "medium", "#text": "url-m" },
        { size: "large", "#text": "url-l" },
        { size: "extralarge", "#text": "url-xl" },
      ];
      expect(parseImage(images)).toEqual({
        size: "extralarge",
        "#text": "url-xl",
      });
    });

    it("should return the large image if extralarge is not available", () => {
      const images: LastFMImage[] = [
        { size: "medium", "#text": "url-m" },
        { size: "large", "#text": "url-l" },
      ];
      expect(parseImage(images)).toEqual({ size: "large", "#text": "url-l" });
    });

    it("should return the first image if neither extralarge nor large is available", () => {
      const images: LastFMImage[] = [
        { size: "medium", "#text": "url-m" },
        { size: "small", "#text": "url-s" },
      ];
      expect(parseImage(images)).toEqual({ size: "medium", "#text": "url-m" });
    });

    it("should return undefined if input is undefined or empty", () => {
      expect(parseImage(undefined)).toBeUndefined();
      expect(parseImage([])).toBeUndefined();
    });
  });

  describe("parseReleaseDate", () => {
    it("should return 'Release date unknown' for falsy input", () => {
      expect(parseReleaseDate()).toBe("Release date unknown");
      expect(parseReleaseDate("")).toBe("Release date unknown");
    });

    it("should return everything before the comma if a comma exists", () => {
      expect(parseReleaseDate("01 Jan 1997, 00:00")).toBe("01 Jan 1997");
    });

    it("should return the exact string if no comma exists", () => {
      expect(parseReleaseDate("1997")).toBe("1997");
    });
  });

  describe("cleanWiki", () => {
    it("should remove the Read more on Last.fm link", () => {
      const input =
        'This is a summary. <a href="https://www.last.fm/music/Radiohead">Read more on Last.fm</a>';
      expect(cleanWiki(input)).toBe("This is a summary. ");
    });

    it("should return empty string if input is undefined", () => {
      expect(cleanWiki()).toBe("");
    });
  });

  describe("getArtistName", () => {
    it("should return the string if artist is a string", () => {
      expect(getArtistName("Radiohead")).toBe("Radiohead");
    });

    it("should return the name property if artist is an object", () => {
      expect(getArtistName({ name: "Radiohead" })).toBe("Radiohead");
    });
  });

  describe("getImageUrl", () => {
    it("should return empty string if imageArray is undefined or not an array", () => {
      expect(getImageUrl(undefined)).toBe("");
      expect(getImageUrl(null as unknown as LastFMImage[])).toBe("");
      expect(getImageUrl({} as unknown as LastFMImage[])).toBe("");
    });

    it("should return the preferred size image url", () => {
      const images: LastFMImage[] = [
        { size: "small", "#text": "url-s" },
        { size: "medium", "#text": "url-m" },
      ];
      expect(getImageUrl(images, "medium")).toBe("url-m");
    });

    it("should return the first image url if preferred size is not found", () => {
      const images: LastFMImage[] = [{ size: "small", "#text": "url-s" }];
      expect(getImageUrl(images, "medium")).toBe("url-s");
    });

    it("should return empty string if found image has no url", () => {
      const images: LastFMImage[] = [{ size: "medium", "#text": "" }];
      expect(getImageUrl(images, "medium")).toBe("");
    });

    it("should return empty string if image has no #text property", () => {
      const images = [{ size: "medium" }] as unknown as LastFMImage[];
      expect(getImageUrl(images, "medium")).toBe("");
    });

    it("should treat missing rating as 0 when comparing", () => {
      const a = {
        value: { rating: null as unknown as number, createdAt: "2026-01-01" },
      };
      const b = {
        value: { rating: null as unknown as number, createdAt: "2026-01-01" },
      };
      expect(compareReviews(a, b, "rating-desc")).toBe(0);
    });

    it("should treat missing rating as 0 and sort accordingly", () => {
      const a = {
        value: { rating: null as unknown as number, createdAt: "2026-01-01" },
      };
      const b = { value: { rating: 3, createdAt: "2026-01-01" } };
      expect(compareReviews(a, b, "rating-desc")).toBeGreaterThan(0);
    });
  });

  describe("padArray", () => {
    it("should pad array with empty strings to reach target length", () => {
      expect(padArray(["a", "b"], 5)).toEqual(["a", "b", "", "", ""]);
    });

    it("should return array unchanged if already at target length", () => {
      expect(padArray(["a", "b", "c"], 3)).toEqual(["a", "b", "c"]);
    });

    it("should return array unchanged if longer than target length", () => {
      expect(padArray(["a", "b", "c", "d"], 2)).toEqual(["a", "b", "c", "d"]);
    });

    it("should not mutate the original array", () => {
      const original = ["a", "b"];
      padArray(original, 4);
      expect(original).toEqual(["a", "b"]);
    });

    it("should handle empty array input", () => {
      expect(padArray([], 3)).toEqual(["", "", ""]);
    });
  });

  describe("hasDuplicates", () => {
    it("should return true when duplicates exist", () => {
      expect(hasDuplicates(["a", "b", "a"])).toBe(true);
    });

    it("should return false when no duplicates exist", () => {
      expect(hasDuplicates(["a", "b", "c"])).toBe(false);
    });

    it("should return false for an empty array", () => {
      expect(hasDuplicates([])).toBe(false);
    });

    it("should return false for a single element array", () => {
      expect(hasDuplicates(["a"])).toBe(false);
    });
  });

  describe("compareReviews", () => {
    const makeReview = (rating: number, date: string, listenedAt?: string) => ({
      value: { rating, createdAt: date, listenedAt },
    });

    it("should sort by rating descending", () => {
      const a = makeReview(4, "2026-01-01");
      const b = makeReview(2, "2026-01-01");
      expect(compareReviews(a, b, "rating-desc")).toBeLessThan(0);
    });

    it("should sort by rating ascending", () => {
      const a = makeReview(2, "2026-01-01");
      const b = makeReview(4, "2026-01-01");
      expect(compareReviews(a, b, "rating-asc")).toBeLessThan(0);
    });

    it("should fall back to date when ratings are equal (rating-desc)", () => {
      const a = makeReview(3, "2026-01-01");
      const b = makeReview(3, "2025-01-01");
      expect(compareReviews(a, b, "rating-desc")).toBeLessThan(0);
    });

    it("should fall back to date when ratings are equal (rating-asc)", () => {
      const a = makeReview(3, "2025-01-01");
      const b = makeReview(3, "2026-01-01");
      expect(compareReviews(a, b, "rating-asc")).toBeGreaterThan(0);
    });

    it("should sort by date descending", () => {
      const a = makeReview(3, "2026-01-01");
      const b = makeReview(3, "2025-01-01");
      expect(compareReviews(a, b, "date-desc")).toBeLessThan(0);
    });

    it("should sort by date ascending", () => {
      const a = makeReview(3, "2025-01-01");
      const b = makeReview(3, "2026-01-01");
      expect(compareReviews(a, b, "date-asc")).toBeLessThan(0);
    });

    it("should prefer listenedAt over createdAt when present", () => {
      const a = makeReview(3, "2022-01-01", "2026-01-01");
      const b = makeReview(3, "2025-01-01");
      expect(compareReviews(a, b, "date-desc")).toBeLessThan(0);
    });

    it("should return 0 when both rating and date are equal", () => {
      const a = makeReview(3, "2026-01-01");
      const b = makeReview(3, "2026-01-01");
      expect(compareReviews(a, b, "date-desc")).toBe(0);
    });

    it("should handle missing/invalid dates gracefully (falls back to 0)", () => {
      const a = makeReview(3, "not-a-date");
      const b = makeReview(3, "not-a-date");
      expect(compareReviews(a, b, "date-asc")).toBe(0);
    });
  });
});
