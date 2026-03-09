"use server";

const API_KEY = process.env.LASTFM_API_KEY;
const BASE_URL = "http://ws.audioscrobbler.com/2.0/";

export interface LastFMImage {
  "#text": string;
  size: "small" | "medium" | "large" | "extralarge" | "";
}

export interface LastFMArtist {
  name: string;
  listeners?: string;
  mbid?: string;
  url?: string;
  streamable?: string;
  image?: LastFMImage[];
  playcount?: string;
}

export interface LastFMAlbum {
  name: string;
  artist: string;
  url?: string;
  image?: LastFMImage[];
  streamable?: string;
  mbid?: string;
}

export interface LastFMTrack {
  name: string;
  artist: string;
  url?: string;
  image?: LastFMImage[];
  streamable?: string;
  mbid?: string;
}

async function fetchLastFM(
  method: string,
  params: Record<string, string> = {},
) {
  if (!API_KEY) {
    throw new Error("Missing LASTFM_API_KEY in environment variables");
  }

  const queryParams = new URLSearchParams({
    method,
    api_key: API_KEY,
    format: "json",
    ...params,
  });
  const url = `${BASE_URL}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Last.fm API error: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch Last.fm method [${method}]:`, error);
    return null;
  }
}

export async function searchAlbum(albumName: string) {
  const data = await fetchLastFM("album.search", { album: albumName });
  return data?.results?.albummatches?.album || [];
}

export async function getAlbumInfo(artistName: string, albumName: string) {
  const data = await fetchLastFM("album.getInfo", {
    artist: artistName,
    album: albumName,
  });
  return data?.album || null;
}

export async function searchArtist(artistName: string) {
  const data = await fetchLastFM("artist.search", { artist: artistName });
  const allArtists = data?.results?.artistmatches?.artist || [];

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

export async function getTopTracks(limit: string = "10") {
  const data = await fetchLastFM("chart.gettoptracks", { limit });
  return data?.tracks?.track || [];
}

export async function getTopArtists(limit: string = "5") {
  const data = await fetchLastFM("chart.gettopartists", { limit });
  return data?.artists?.artist || [];
}
