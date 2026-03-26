import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  shuffle,
  parseImage,
  parseReleaseDate,
  cleanWiki,
  getArtistName,
  getImageUrl,
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
    it("returns the extralarge image if available", () => {
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

    it("returns the large image if extralarge is not available", () => {
      const images: LastFMImage[] = [
        { size: "medium", "#text": "url-m" },
        { size: "large", "#text": "url-l" },
      ];
      expect(parseImage(images)).toEqual({ size: "large", "#text": "url-l" });
    });

    it("returns the first image if neither extralarge nor large is available", () => {
      const images: LastFMImage[] = [
        { size: "medium", "#text": "url-m" },
        { size: "small", "#text": "url-s" },
      ];
      expect(parseImage(images)).toEqual({ size: "medium", "#text": "url-m" });
    });

    it("returns undefined if input is undefined or empty", () => {
      expect(parseImage(undefined)).toBeUndefined();
      expect(parseImage([])).toBeUndefined();
    });
  });

  describe("parseReleaseDate", () => {
    it("returns 'Release date unknown' for falsy input", () => {
      expect(parseReleaseDate()).toBe("Release date unknown");
      expect(parseReleaseDate("")).toBe("Release date unknown");
    });

    it("returns everything before the comma if a comma exists", () => {
      expect(parseReleaseDate("01 Jan 1997, 00:00")).toBe("01 Jan 1997");
    });

    it("returns the exact string if no comma exists", () => {
      expect(parseReleaseDate("1997")).toBe("1997");
    });
  });

  describe("cleanWiki", () => {
    it("removes the Read more on Last.fm link", () => {
      const input =
        'This is a summary. <a href="https://www.last.fm/music/Radiohead">Read more on Last.fm</a>';
      expect(cleanWiki(input)).toBe("This is a summary. ");
    });

    it("returns empty string if input is undefined", () => {
      expect(cleanWiki()).toBe("");
    });
  });

  describe("getArtistName", () => {
    it("returns the string if artist is a string", () => {
      expect(getArtistName("Radiohead")).toBe("Radiohead");
    });

    it("returns the name property if artist is an object", () => {
      expect(getArtistName({ name: "Radiohead" })).toBe("Radiohead");
    });
  });

  describe("getImageUrl", () => {
    it("returns empty string if imageArray is undefined or not an array", () => {
      expect(getImageUrl(undefined)).toBe("");
      expect(getImageUrl(null as unknown as LastFMImage[])).toBe("");
      expect(getImageUrl({} as unknown as LastFMImage[])).toBe("");
    });

    it("returns the preferred size image url", () => {
      const images: LastFMImage[] = [
        { size: "small", "#text": "url-s" },
        { size: "medium", "#text": "url-m" },
      ];
      expect(getImageUrl(images, "medium")).toBe("url-m");
    });

    it("returns the first image url if preferred size is not found", () => {
      const images: LastFMImage[] = [{ size: "small", "#text": "url-s" }];
      expect(getImageUrl(images, "medium")).toBe("url-s");
    });

    it("returns empty string if found image has no url", () => {
      const images: LastFMImage[] = [{ size: "medium", "#text": "" }];
      expect(getImageUrl(images, "medium")).toBe("");
    });
  });
});
