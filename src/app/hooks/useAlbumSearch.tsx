import { useState, useEffect } from "react";
import { searchAlbum, LastFMAlbum } from "@/lib/lastfm";

export function useAlbumSearch() {
  // constants used to hold results and queries for ReviewForm
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LastFMAlbum[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // results retrieved based on query and results are then reduced for ReviewForm
  // 5 results presented for readability
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
