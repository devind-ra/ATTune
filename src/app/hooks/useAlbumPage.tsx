// useAlbumPage hook
// Contains the following:
// -  Function for setting album info, tags and loading state

import { useEffect, useState } from "react";
import {
  getAlbumInfo,
  getAlbumTopTags,
  LastFMAlbumInfo,
  LastFMTag,
} from "@/lib/lastfm";

export function useAlbumPage(artistName: string, albumName: string) {
  // constants storing album and tags from last.fm
  const [albumInfo, setAlbumInfo] = useState<LastFMAlbumInfo>();
  const [tags, setTags] = useState<LastFMTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // calling API methods for retrieving album info and top tags from last.fm file
  // error handling if no data is found
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
