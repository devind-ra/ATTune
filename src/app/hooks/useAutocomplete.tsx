// useAutocomplete Hook
// Contains the following:
// - Deals with suggestions for albums and artists
// - Calls to fetchSuggestions for fetching suggestions
// - Handles search query states

import { useState, useEffect } from "react";

interface UseAutocompleteProps {
  value: string;
  fetchSuggestions: (q: string) => Promise<string[]>;
  excludeValues?: string[];
  onChange: (val: string) => void;
}

export function useAutocomplete({
  value,
  fetchSuggestions,
  excludeValues = [],
  onChange,
}: UseAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  useEffect(() => {
    if (!hasInteracted) return;

    const timer = setTimeout(async () => {
      const trimmed = searchQuery.trim();
      if (trimmed.length <= 2) {
        setSearchResults([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      setShowSuggestions(true);
      try {
        const results = await fetchSuggestions(searchQuery);
        const safeResults = Array.isArray(results) ? results : [];
        setSearchResults(
          safeResults.filter(
            (r) =>
              !excludeValues.some(
                (ex) => ex.trim().toLowerCase() === r.trim().toLowerCase(),
              ),
          ),
        );
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions, excludeValues]);

  const handleSelect = (s: string) => {
    setSearchQuery(s);
    onChange(s);
    setSearchResults([]);
    setShowSuggestions(false);
    setHasInteracted(false);
  };

  const handleFocus = () => {
    if (searchResults.length > 0) setShowSuggestions(true);
  };

  const handleBlur = () => setTimeout(() => setShowSuggestions(false), 200);

  const handleQueryChange = (q: string) => {
    setSearchQuery(q);
    setHasInteracted(true);
  };

  return {
    searchQuery,
    searchResults,
    isSearching,
    showSuggestions,
    handleSelect,
    handleFocus,
    handleBlur,
    handleQueryChange,
  };
}
