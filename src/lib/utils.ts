export const getArtistName = (artist: string | { name: string }) =>
  typeof artist === "string" ? artist : artist.name;
