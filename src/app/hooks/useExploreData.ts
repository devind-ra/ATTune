// useExploreData hook
// Contains the following:
// - Fetches global trending tracks and tag discovery

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { atApiService } from "@/lib/atproto";
import {
  getTopTags,
  getTopTracks,
  getTopArtists,
  getTopAlbumsByTag,
  LastFMTag,
  LastFMTrack,
  LastFMAlbum,
  LastFMArtist,
} from "@/lib/lastfm";
import { shuffle } from "@/lib/utils";

export interface DiscoveryTagData {
  tag: LastFMTag;
  albums: LastFMAlbum[];
}

interface ExploreData {
  discoveryData: DiscoveryTagData[];
  topTracks: LastFMTrack[];
  topArtists: LastFMArtist[];
  isReady: boolean;
}

// eslint-disable-next-line max-lines-per-function
export function useExploreData(): ExploreData {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  const [discoveryData, setDiscoveryData] = useState<DiscoveryTagData[]>([]);
  const [topTracks, setTopTracks] = useState<LastFMTrack[]>([]);
  const [topArtists, setTopArtists] = useState<LastFMArtist[]>([]);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/");
      return;
    }
    if (!session) return;

    async function loadData(did: string) {
      try {
        const [tastes, tags, tracks, artists] = await Promise.all([
          atApiService.getTastes(did),
          getTopTags("50"),
          getTopTracks("10"),
          getTopArtists("10"),
        ]);

        const userGenres = new Set(
          (tastes?.topGenres || []).map((g: string) => g.toLowerCase()),
        );

        const filteredTags = tags.filter(
          (tag: LastFMTag) => !userGenres.has(tag.name.toLowerCase()),
        );

        const selectedTags = shuffle(filteredTags).slice(0, 3) as LastFMTag[];

        const allDiscoveryResults = await Promise.all(
          selectedTags.map(async (tag) => {
            const albums = await getTopAlbumsByTag(tag.name, "5");
            return { tag, albums };
          }),
        );
        const discoveryResults = allDiscoveryResults
          .filter(({ albums }) => albums.length > 0)
          .slice(0, 3);

        setDiscoveryData(discoveryResults);
        setTopTracks(tracks);
        setTopArtists(artists);
      } catch (err) {
        console.error(err);
      }
    }

    loadData(session!.did);
  }, [session, isLoading, router]);

  return {
    discoveryData,
    topTracks,
    topArtists,
    isReady: !isLoading && !!session,
  };
}
