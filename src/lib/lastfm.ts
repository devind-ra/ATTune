// Last.fm API Service
// Contains the following:
// - Interfaces for storing data retrieved from Last.fm
// - Functions for searching and retrieving data from Last.fm

"use server";

const API_KEY = process.env.LASTFM_API_KEY;
// eslint-disable-next-line sonarjs/no-clear-text-protocols
const BASE_URL = "http://ws.audioscrobbler.com/2.0/";

export interface LastFMImage {
  "#text": string;
  size: "small" | "medium" | "large" | "extralarge" | "";
}

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

export interface LastFMAlbumInfo {
  name: string;
  artist: string;
  url: string;
  image: LastFMImage[];
  tracks: {
    track: LastFMTrack[];
  };
  wiki: {
    summary: string;
    content: string;
    published: string;
  };
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

export interface LastFMTag {
  name: string;
  count?: number;
  url?: string;
}

export interface LastFMAlbum {
  name: string;
  artist: string | { name: string; mbid?: string; url?: string };
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

export async function getTopTracks(limit: string = "5") {
  const data = await fetchLastFM("chart.gettoptracks", { limit });
  return data?.tracks?.track || [];
}

export async function getTopArtists(limit: string = "5") {
  const data = await fetchLastFM("chart.gettopartists", { limit });
  return data?.artists?.artist || [];
}

export async function searchTag(tagName: string) {
  const data = await fetchLastFM("tag.search", { tag: tagName });
  return data?.results?.tagmatches?.tag || [];
}

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

export async function getTopArtistsByTag(tag: string, limit: string = "5") {
  const data = await fetchLastFM("tag.gettopartists", {
    tag,
    limit,
  });
  return data?.topartists?.artist || [];
}

export async function getTopAlbumsByTag(tag: string, limit: string = "10") {
  const data = await fetchLastFM("tag.gettopalbums", {
    tag,
    limit,
  });
  return data?.albums?.album || [];
}

export async function getArtistInfo(artistName: string) {
  const data = await fetchLastFM("artist.getinfo", {
    artist: artistName,
    autocorrect: "1",
  });
  return data?.artist || null;
}

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

export async function getAlbumTopTags(artistName: string, albumName: string) {
  const data = await fetchLastFM("album.gettoptags", {
    artist: artistName,
    album: albumName,
    autocorrect: "1",
  });
  return data?.toptags?.tag || [];
}
