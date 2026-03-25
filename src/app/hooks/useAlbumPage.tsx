// useAlbumPage hook
// Contains the following:
// -  Function for setting album info, tags and loading state

import { useEffect, useState } from "react";
import {
  getAlbumInfo,
  getAlbumTopTags,
  LastFMAlbumInfo,
  LastFMTag,
} from "../../lib/lastfm";

export function useAlbumPage(artistName: string, albumName: string) {
  const [albumInfo, setAlbumInfo] = useState<LastFMAlbumInfo>();
  const [tags, setTags] = useState<LastFMTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!artistName || !albumName) return;

    async function load() {
      setIsLoading(true);
      try {
        const [info, toptags] = await Promise.all([
          getAlbumInfo(artistName, albumName),
          getAlbumTopTags(artistName, albumName),
        ]);
        setAlbumInfo(info);
        setTags(toptags);
      } catch (err) {
        console.error("Failed to load album data", err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [artistName, albumName]);

  return { albumInfo, tags, isLoading };
}
