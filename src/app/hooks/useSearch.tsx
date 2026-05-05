// useSearch hook
// Contains the following:
// - Searches for artists, albums and users

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  searchArtist,
  searchAlbum,
  LastFMArtist,
  LastFMAlbum,
} from "@/lib/lastfm";
import { atApiService } from "@/lib/atproto";
import { AppBskyActorDefs } from "@atproto/api";

const MAX_RESULTS = 10;
const POPULARITY_THRESHOLD = 100000;

// helper function used to order data shown in search results for search page
function parsePrimaryType(
  parsedArtists: LastFMArtist[],
  parsedAlbums: LastFMAlbum[],
  query: string,
): "artist" | "album" {
  // takes results for both album and artist and then finds out which has is more popular
  const q = query.toLowerCase();
  const firstAlbum = parsedAlbums[0]?.name.toLowerCase();
  const firstArtist = parsedArtists[0]?.name.toLowerCase();

  const isArtistMatch = firstArtist === q;
  const isAlbumMatch = firstAlbum === q;

  if (isAlbumMatch && !isArtistMatch) return "album";
  if (isArtistMatch && !isAlbumMatch) return "artist";

  const listeners = parseInt(parsedArtists[0]?.listeners ?? "0", 10);
  return listeners > POPULARITY_THRESHOLD ? "artist" : "album";
}

// helper function to cover results to array
function toArray<T>(result: T | T[] | null | undefined): T[] {
  if (!result) return [];
  return Array.isArray(result) ? result.slice(0, MAX_RESULTS) : [result];
}

// interface used to handle states when searching is conducted
// onSuccess is key to retrieve the data for artists, albums and users
interface FetchOptions {
  onStart: () => void;
  onSuccess: (
    artists: LastFMArtist[],
    albums: LastFMAlbum[],
    users: AppBskyActorDefs.ProfileViewBasic[],
  ) => void;
  onError: (error: Error) => void;
  onDone: () => void;
}

// helper function to fetch results using Last.fm API methods
// converts results to arrays and then used them within page
async function fetchResults(query: string, options: FetchOptions) {
  options.onStart();
  try {
    const [artistResults, albumResults, userResults] = await Promise.all([
      searchArtist(query),
      searchAlbum(query),
      atApiService.searchUsers(query),
    ]);

    const parsedArtists = toArray(artistResults);
    const parsedAlbums = toArray(albumResults);

    options.onSuccess(parsedArtists, parsedAlbums, userResults);
  } catch (error) {
    options.onError(error as Error);
  } finally {
    options.onDone();
  }
}

export function useSearch(query: string | null) {
  // constants store data associated with album, artists and users to be showing in search page
  const router = useRouter();
  const { session, isLoading: authLoading } = useAuth();
  const [artists, setArtists] = useState<LastFMArtist[]>([]);
  const [albums, setAlbums] = useState<LastFMAlbum[]>([]);
  const [users, setUsers] = useState<AppBskyActorDefs.ProfileViewBasic[]>([]);
  const [primaryResultType, setPrimaryResultType] = useState<
    "artist" | "album"
  >("artist");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/");
    }
  }, [session, authLoading, router]);

  // Sets the artist, album and user values retrieved from fetchResults()
  // Handles error if issue occurs with data retrieval
  useEffect(() => {
    if (!query) return;

    fetchResults(query, {
      onStart: () => setIsSearching(true),
      onSuccess: (a, b, u) => {
        setArtists(a);
        setAlbums(b);
        setUsers(u);
        setPrimaryResultType(parsePrimaryType(a, b, query));
      },
      onError: (err) => console.error("Search failed:", err),
      onDone: () => setIsSearching(false),
    });
  }, [query]);

  return {
    artists,
    albums,
    users,
    primaryResultType,
    isSearching,
    session,
    authLoading,
  };
}
