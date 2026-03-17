"use server";

// Last.fm API Integration functions

// Importing API key from environment variables
const API_KEY = process.env.LASTFM_API_KEY;
// Base URL for Last.fm API
const BASE_URL = "http://ws.audioscrobbler.com/2.0/";

// Last.fm API Interfaces

// Last.fm Image Interface
export interface LastFMImage {
  "#text": string;
  size: "small" | "medium" | "large" | "extralarge" | "";
}

// Last.fm Artist Info Interface
export interface LastFMArtistInfo {
  name: string;
  url: string;
  stats: {
    listeners: string;
    playcount: string;
  };
  tags: {
    tag: LastFMTag[];
  };
  bio: {
    summary: string;
    content: string;
  };
}

// Last.fm Artist Interface
export interface LastFMArtist {
  name: string;
  listeners?: string;
  mbid?: string;
  url?: string;
  streamable?: string;
  image?: LastFMImage[];
  playcount?: string;
}

// Last.fm Tag Interface
export interface LastFMTag {
  name: string;
  count?: number;
  url?: string;
}

// Last.fm Album Interface
export interface LastFMAlbum {
  name: string;
  artist: string | { name: string; mbid?: string; url?: string };
  url?: string;
  image?: LastFMImage[];
  streamable?: string;
  mbid?: string;
}

// Last.fm Track Interface
export interface LastFMTrack {
  name: string;
  artist: string;
  url?: string;
  image?: LastFMImage[];
  streamable?: string;
  mbid?: string;
}

// Last.fm API fetch function
async function fetchLastFM(
  method: string,
  params: Record<string, string> = {},
) {
  if (!API_KEY) {
    throw new Error("Missing LASTFM_API_KEY in environment variables");
  }

  // Query parameters for Last.fm API
  const queryParams = new URLSearchParams({
    method,
    api_key: API_KEY,
    format: "json",
    ...params,
  });
  const url = `${BASE_URL}?${queryParams.toString()}`;

  // Fetching data every hour from Last.fm API
  try {
    const response = await fetch(url, {
      next: { revalidate: 60 * 60 },
    });
    if (!response.ok) throw new Error(`Last.fm API error: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch Last.fm method [${method}]:`, error);
    return null;
  }
}

// Last.fm API functions

// Search album function
export async function searchAlbum(albumName: string) {
  const data = await fetchLastFM("album.search", { album: albumName });
  return data?.results?.albummatches?.album || [];
}

// Retrieve album info function
export async function getAlbumInfo(artistName: string, albumName: string) {
  const data = await fetchLastFM("album.getInfo", {
    artist: artistName,
    album: albumName,
  });
  return data?.album || null;
}

// Search artist function
export async function searchArtist(artistName: string) {
  const data = await fetchLastFM("artist.search", { artist: artistName });
  const allArtists = data?.results?.artistmatches?.artist || [];

  // Filtering for artists with '&', 'feat', 'ft', or ',' in their name
  const filteredArtists = allArtists.filter((artist: LastFMArtist) => {
    const name = artist.name.toLowerCase();

    if (
      name.includes("&") ||
      name.includes(" feat") ||
      name.includes(" ft") ||
      name.includes(",")
    ) {
      if (
        !artistName.toLowerCase().includes("&") &&
        !artistName.toLowerCase().includes("feat")
      ) {
        return false;
      }
    }

    return true;
  });

  return filteredArtists;
}

// Retrieve top tracks function
export async function getTopTracks(limit: string = "5") {
  const data = await fetchLastFM("chart.gettoptracks", { limit });
  return data?.tracks?.track || [];
}

// Retrieve top artists function
export async function getTopArtists(limit: string = "5") {
  const data = await fetchLastFM("chart.gettopartists", { limit });
  return data?.artists?.artist || [];
}

// Search tag function
export async function searchTag(tagName: string) {
  const data = await fetchLastFM("tag.search", { tag: tagName });
  return data?.results?.tagmatches?.tag || [];
}

// Retrieve top tags function
export async function getTopTags(limit: string = "50") {
  const data = await fetchLastFM("chart.gettoptags", { limit });
  return data?.tags?.tag || [];
}

export async function getSimilarArtists(artist: string, limit: string = "10") {
  const data = await fetchLastFM("artist.getsimilar", {
    artist,
    limit,
  });
  return data?.similarartists?.artist || [];
}

// Retrieve top artists by tag function
export async function getTopArtistsByTag(tag: string, limit: string = "5") {
  const data = await fetchLastFM("tag.gettopartists", {
    tag,
    limit,
  });
  return data?.topartists?.artist || [];
}

// Retrieve top albums by tag function
export async function getTopAlbumsByTag(tag: string, limit: string = "10") {
  const data = await fetchLastFM("tag.gettopalbums", {
    tag,
    limit,
  });
  return data?.albums?.album || [];
}

// Retrieve artist info function
export async function getArtistInfo(artistName: string) {
  const data = await fetchLastFM("artist.getinfo", {
    artist: artistName,
    autocorrect: "1",
  });
  return data?.artist || null;
}

// Retrieve artist top tracks function
export async function getArtistTopTracks(
  artistName: string,
  limit: string = "5",
) {
  const data = await fetchLastFM("artist.gettoptracks", {
    artist: artistName,
    autocorrect: "1",
    limit,
  });
  return data?.toptracks?.track || [];
}

// Retrieve artist top albums function
export async function getArtistTopAlbums(
  artistName: string,
  limit: string = "10",
) {
  const data = await fetchLastFM("artist.gettopalbums", {
    artist: artistName,
    autocorrect: "1",
    limit,
  });
  return data?.topalbums?.album || [];
}
