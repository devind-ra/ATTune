// useHomeData hook
// Contains the following:
// - Hook for retrieving data for the home page

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { atApiService } from "~/lib/atproto";
import {
  getSimilarArtists,
  getTopAlbumsByTag,
  getTopArtists,
  LastFMArtist,
  LastFMAlbum,
} from "@/lib/lastfm";
import { getArtistName, shuffle } from "@/lib/utils";

interface HomeData {
  topArtists: LastFMArtist[];
  recommendedArtists: LastFMArtist[];
  recommendedAlbums: LastFMAlbum[];
  isReady: boolean;
}

function removeDupeArtists(artists: LastFMArtist[]): LastFMArtist[] {
  return Array.from(new Map(artists.map((a) => [a.name, a])).values());
}

function removeDupeAlbums(albums: LastFMAlbum[]): LastFMAlbum[] {
  return Array.from(
    new Map(albums.map((a) => [a.name + getArtistName(a.artist), a])).values(),
  );
}

export function useHomeData(): HomeData {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  const [topArtists, setTopArtists] = useState<LastFMArtist[]>([]);
  const [recommendedArtists, setRecommendedArtists] = useState<LastFMArtist[]>(
    [],
  );
  const [recommendedAlbums, setRecommendedAlbums] = useState<LastFMAlbum[]>([]);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/");
      return;
    }
    if (!session) return;

    async function loadRecommendations(did: string) {
      const tastes = await atApiService.getTastes(did);
      if (!tastes) return;

      const artistResults: LastFMArtist[] = [];
      const albumResults: LastFMAlbum[] = [];

      for (const artist of tastes.topArtists || []) {
        artistResults.push(...(await getSimilarArtists(artist, "5")));
      }
      for (const genre of tastes.topGenres || []) {
        albumResults.push(...(await getTopAlbumsByTag(genre, "5")));
      }

      setRecommendedArtists(
        shuffle(removeDupeArtists(artistResults)).slice(0, 5),
      );
      setRecommendedAlbums(shuffle(removeDupeAlbums(albumResults)).slice(0, 5));
    }

    async function loadData() {
      try {
        await loadRecommendations(session!.did);
        setTopArtists(await getTopArtists());
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, [session, isLoading, router]);

  return {
    topArtists,
    recommendedArtists,
    recommendedAlbums,
    isReady: !isLoading && !!session,
  };
}
