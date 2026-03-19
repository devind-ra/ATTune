// Utility functions
// Contains the following:
// - Helper functions for data manipulation

export const getArtistName = (artist: string | { name: string }) =>
  typeof artist === "string" ? artist : artist.name;
