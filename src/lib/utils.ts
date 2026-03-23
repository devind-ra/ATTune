// Utility functions
// Contains the following:
// - Helper functions for data manipulation

import { LastFMImage } from "./lastfm";

export function parseImage(images: LastFMImage[] | undefined) {
  return (
    images?.find((i) => i.size === "extralarge") ??
    images?.find((i) => i.size === "large") ??
    images?.[0]
  );
}

export function parseReleaseDate(published?: string) {
  if (!published) return "Release date unknown";
  return published.includes(",") ? published.split(",")[0] : published;
}

export function cleanWiki(summary?: string) {
  return (
    summary?.replace(
      /<a href="https:\/\/www\.last\.fm[^>]+>Read more on Last\.fm<\/a>/g,
      "",
    ) ?? ""
  );
}

export const getArtistName = (artist: string | { name: string }) =>
  typeof artist === "string" ? artist : artist.name;

export const getImageUrl = (
  imageArray: LastFMImage[] | undefined,
  preferredSize = "medium",
): string => {
  if (!imageArray || !Array.isArray(imageArray)) return "";
  const img = imageArray.find((i) => i.size === preferredSize) ?? imageArray[0];
  return img?.["#text"] ?? "";
};
