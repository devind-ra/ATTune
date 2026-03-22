import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import {
  searchArtist,
  searchAlbum,
  LastFMArtist,
  LastFMAlbum,
} from "../../lib/lastfm";

function parsePrimaryType(
  parsedArtists: LastFMArtist[],
  parsedAlbums: LastFMAlbum[],
  query: string,
): "artist" | "album" {
  const exactArtistMatch =
    parsedArtists.length > 0 &&
    parsedArtists[0].name.toLowerCase() === query.toLowerCase();
  const exactAlbumMatch =
    parsedAlbums.length > 0 &&
    parsedAlbums[0].name.toLowerCase() === query.toLowerCase();

  if (exactAlbumMatch && !exactArtistMatch) return "album";
  if (exactArtistMatch && !exactAlbumMatch) return "artist";

  const artistPopularity =
    parsedArtists.length > 0 && parsedArtists[0].listeners
      ? parseInt(parsedArtists[0].listeners, 10)
      : 0;

  return artistPopularity > 100000 ? "artist" : "album";
}

function toArray<T>(result: T | T[] | null | undefined): T[] {
  if (!result) return [];
  return Array.isArray(result) ? result.slice(0, 10) : [result];
}

export function useSearch(query: string | null) {
  const router = useRouter();
  const { session, isLoading: authLoading } = useAuth();
  const [artists, setArtists] = useState<LastFMArtist[]>([]);
  const [albums, setAlbums] = useState<LastFMAlbum[]>([]);
  const [primaryResultType, setPrimaryResultType] = useState<
    "artist" | "album"
  >("artist");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/");
    }
  }, [session, authLoading, router]);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const [artistResults, albumResults] = await Promise.all([
          searchArtist(query),
          searchAlbum(query),
        ]);

        const parsedArtists = toArray(artistResults);
        const parsedAlbums = toArray(albumResults);

        setArtists(parsedArtists);
        setAlbums(parsedAlbums);
        setPrimaryResultType(
          parsePrimaryType(parsedArtists, parsedAlbums, query),
        );
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, [query]);

  return {
    artists,
    albums,
    primaryResultType,
    isSearching,
    session,
    authLoading,
  };
}
