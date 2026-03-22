// Utility functions
// Contains the following:
// - Helper functions for data manipulation
import { LastFMImage } from "./lastfm";

export const getArtistName = (artist: string | { name: string }) =>
  typeof artist === "string" ? artist : artist.name;

export const getImageUrl = (
  imageArray: LastFMImage[] | undefined,
  preferredSize = "medium",
): string => {
  if (!imageArray || !Array.isArray(imageArray)) return "";
  const img =
    imageArray.find((i) => i.size === preferredSize) ?? imageArray[0];
  return img?.["#text"] ?? "";
};
