import { useState, useEffect } from "react";
import { searchAlbum, LastFMAlbum } from "../../lib/lastfm";

export function useAlbumSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LastFMAlbum[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length <= 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchAlbum(searchQuery);
        setSearchResults(Array.isArray(results) ? results.slice(0, 5) : []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    clearSearch,
  };
}
