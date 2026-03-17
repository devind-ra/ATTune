// Utility functions to be used across the application

// Utility function to obtain the artist name from the last.fm API response
export const getArtistName = (artist: string | { name: string }) =>
  typeof artist === "string" ? artist : artist.name;
