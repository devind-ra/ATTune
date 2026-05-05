// useArtistData hook
// Contains the following:
// - Uses promise.all to fetch artist info, top tracks and top albums to return data

import { useEffect, useState } from "react";
import {
  getArtistInfo,
  getArtistTopTracks,
  getArtistTopAlbums,
  LastFMTrack,
  LastFMAlbum,
  LastFMArtistInfo,
} from "@/lib/lastfm";

interface ArtistData {
  artistInfo: LastFMArtistInfo | null;
  topTracks: LastFMTrack[];
  topAlbums: LastFMAlbum[];
  isLoading: boolean;
}

export function useArtistData(artistName: string): ArtistData {
  // constants used to data for artist template page
  const [artistInfo, setArtistInfo] = useState<LastFMArtistInfo | null>(null);
  const [topTracks, setTopTracks] = useState<LastFMTrack[]>([]);
  const [topAlbums, setTopAlbums] = useState<LastFMAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // uses last.fm API methods to store info, tracks and albums to be used for page
  useEffect(() => {
    if (!artistName) return;
    async function loadData() {
      setIsLoading(true);
      try {
        const [info, tracks, albums] = await Promise.all([
          getArtistInfo(artistName),
          getArtistTopTracks(artistName, "5"),
          getArtistTopAlbums(artistName, "10"),
        ]);
        setArtistInfo(info);
        setTopTracks(tracks);
        setTopAlbums(albums);
      } catch (err) {
        console.error("Failed to load artist data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [artistName]);

  return { artistInfo, topTracks, topAlbums, isLoading };
}
