// Utility functions
// Contains the following:
// - Helper functions for data manipulation

import { LastFMImage } from "./lastfm";

export const ARTIST_COUNT = 5;
export const GENRE_COUNT = 3;

export function padArray(arr: string[], length: number): string[] {
  const padded = [...arr];
  while (padded.length < length) padded.push("");
  return padded;
}

export function hasDuplicates(arr: string[]): boolean {
  return new Set(arr).size !== arr.length;
}
export function shuffle<T>(arr: T[]): T[] {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    const j = randomBuffer[0]! % (i + 1);
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
}

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

function compareByRating(
  a: { value: { rating: number } },
  b: { value: { rating: number } },
  sortBy: string,
) {
  const ratingA = a.value.rating ?? 0;
  const ratingB = b.value.rating ?? 0;
  if (ratingA === ratingB) return 0;
  return sortBy === "rating-desc" ? ratingB - ratingA : ratingA - ratingB;
}

function compareByDate(
  a: { value: { listenedAt?: string; createdAt: string } },
  b: { value: { listenedAt?: string; createdAt: string } },
  sortBy: string,
) {
  const timeA =
    new Date(a.value.listenedAt || a.value.createdAt).getTime() || 0;
  const timeB =
    new Date(b.value.listenedAt || b.value.createdAt).getTime() || 0;

  return sortBy === "date-asc" ? timeA - timeB : timeB - timeA;
}

export function compareReviews(
  a: { value: { rating: number; listenedAt?: string; createdAt: string } },
  b: { value: { rating: number; listenedAt?: string; createdAt: string } },
  sortBy: string,
) {
  if (sortBy.includes("rating")) {
    const ratingDiff = compareByRating(a, b, sortBy);
    if (ratingDiff !== 0) return ratingDiff;
  }
  return compareByDate(a, b, sortBy);
}
