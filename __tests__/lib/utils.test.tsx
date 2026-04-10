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
  });
});
