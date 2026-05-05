// Last.fm API Service
// Contains the following:
// - Interfaces for storing data retrieved from Last.fm
// - Functions for searching and retrieving data from Last.fm

"use server";

// eslint-disable-next-line sonarjs/no-clear-text-protocols
const BASE_URL = "http://ws.audioscrobbler.com/2.0/";

// interface for LastFM images
export interface LastFMImage {
  "#text": string;
  size: "small" | "medium" | "large" | "extralarge" | "";
}

// interface for LastFM artist info
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

// interface for LastFM album info
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

// interface for LastFM artist
export interface LastFMArtist {
  name: string;
  listeners?: string;
  mbid?: string;
  url?: string;
  streamable?: string;
  image?: LastFMImage[];
  playcount?: string;
}

// interface for LastFM tag
export interface LastFMTag {
  name: string;
  count?: number;
  url?: string;
}

// interface for LastFM album
export interface LastFMAlbum {
  name: string;
  artist: string | { name: string; mbid?: string; url?: string };
  url?: string;
  image?: LastFMImage[];
  streamable?: string;
  mbid?: string;
}

// interface for LastFM track
export interface LastFMTrack {
  name: string;
  artist: string;
  url?: string;
  image?: LastFMImage[];
  streamable?: string;
  mbid?: string;
}

// function to fetch data from Last.fm using .get() method
// method is the API method to call Last.fm with
// format is kept in JSON
// response is fetched every hour
async function fetchLastFM(
  method: string,
  params: Record<string, string> = {},
) {
  try {
    const API_KEY = process.env.LASTFM_API_KEY;
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

// function to search for an album using 'album.search' with the album name
export async function searchAlbum(albumName: string) {
  const data = await fetchLastFM("album.search", { album: albumName });
  return data?.results?.albummatches?.album || [];
}

// function to get the info of an album using 'album.getinfo' with the artist name and album name
export async function getAlbumInfo(artistName: string, albumName: string) {
  const data = await fetchLastFM("album.getInfo", {
    artist: artistName,
    album: albumName,
  });
  return data?.album || null;
}

// function to search for an artist using 'artist.search' with the artist name
// artists are then filtered to remove any featured artists
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

// function used to retrieve the top tracks (limit of 5) using 'chart.gettoptracks'
export async function getTopTracks(limit: string = "5") {
  const data = await fetchLastFM("chart.gettoptracks", { limit });
  return data?.tracks?.track || [];
}

// function used to retrieve the top artists (limit of 5) using 'chart.gettopartists'
export async function getTopArtists(limit: string = "5") {
  const data = await fetchLastFM("chart.gettopartists", { limit });
  return data?.artists?.artist || [];
}

// function to search for a tag using 'tag.search' with the tag name
export async function searchTag(tagName: string) {
  const data = await fetchLastFM("tag.search", { tag: tagName });
  return data?.results?.tagmatches?.tag || [];
}

// function used to retrieve the top tags (limit of 50) using 'chart.gettoptags'
export async function getTopTags(limit: string = "50") {
  const data = await fetchLastFM("chart.gettoptags", { limit });
  return data?.tags?.tag || [];
}

// function to get the similar artists of an artist (limit of 10) using 'artist.getsimilar' with the artist name
export async function getSimilarArtists(artist: string, limit: string = "10") {
  const data = await fetchLastFM("artist.getsimilar", {
    artist,
    limit,
  });
  return data?.similarartists?.artist || [];
}

// function to get the top artists of a tag (limit of 5) using 'tag.gettopartists' with the tag name
export async function getTopArtistsByTag(tag: string, limit: string = "5") {
  const data = await fetchLastFM("tag.gettopartists", {
    tag,
    limit,
  });
  return data?.topartists?.artist || [];
}

// function to get the top albums of a tag (limit of 10) using 'tag.gettopalbums' with the tag name
export async function getTopAlbumsByTag(tag: string, limit: string = "10") {
  const data = await fetchLastFM("tag.gettopalbums", {
    tag,
    limit,
  });
  return data?.albums?.album || [];
}

// function to get the info of an artist (limit of 1) using 'artist.getinfo' with the artist name
export async function getArtistInfo(artistName: string) {
  const data = await fetchLastFM("artist.getinfo", {
    artist: artistName,
    autocorrect: "1",
  });
  return data?.artist || null;
}

// function to get the top tracks of an artist (limit of 5) using 'artist.gettoptracks' with the artist name
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

// function to get the top albums of an artist (limit of 10) using 'artist.gettopalbums' with the artist name
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

// function to get the top tags of an album using 'album.gettoptags' with the artist name and album name
export async function getAlbumTopTags(artistName: string, albumName: string) {
  const data = await fetchLastFM("album.gettoptags", {
    artist: artistName,
    album: albumName,
    autocorrect: "1",
  });
  return data?.toptags?.tag || [];
}

// function to get the top artists of a country (limit of 10) using 'geo.gettopartists' with the country name
export async function getGeoTopArtists(country: string, limit: string = "10") {
  const data = await fetchLastFM("geo.gettopartists", {
    country,
    limit,
  });
  return data?.topartists?.artist || [];
}
