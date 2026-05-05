// useAutocomplete Hook
// Contains the following:
// - Deals with suggestions for albums and artists
// - Calls to fetchSuggestions for fetching suggestions
// - Handles search query states
// - Resolves results by filtering out excluded values

import { useState, useEffect, useCallback } from "react";

interface UseAutocompleteProps {
  value: string;
  fetchSuggestions: (q: string) => Promise<string[]>;
  excludeValues?: string[];
  onChange: (val: string) => void;
}

// helper function to handle autocomplete results
async function resolveResults(
  query: string,
  fetchSuggestions: (q: string) => Promise<string[]>,
  excludeValues: string[],
): Promise<string[]> {
  const results = await fetchSuggestions(query);
  const safeResults = Array.isArray(results) ? results : [];
  return safeResults.filter(
    (r) =>
      !excludeValues.some(
        (ex) => ex.trim().toLowerCase() === r.trim().toLowerCase(),
      ),
  );
}

// eslint-disable-next-line max-lines-per-function
export function useAutocomplete({
  value,
  fetchSuggestions,
  excludeValues = [],
  onChange,
}: UseAutocompleteProps) {
  // constants to hold data for search queries and suggestions
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
    if (searchQuery.trim().length <= 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(true);

    // timer used to ensure data can be safely retrieved from API methods
    const timer = setTimeout(() => {
      resolveResults(searchQuery, fetchSuggestions, excludeValues)
        .then(setSearchResults)
        .catch((err) => console.error("Search failed:", err))
        .finally(() => setIsSearching(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions, excludeValues, hasInteracted]);

  // handling the selection of a specific string from the results
  const handleSelect = useCallback(
    (s: string) => {
      setSearchQuery(s);
      onChange(s);
      setSearchResults([]);
      setShowSuggestions(false);
      setHasInteracted(false);
    },
    [onChange],
  );

  // handleFocus, handleBlur and handleQueryChange help deal with the search query and results
  const handleFocus = useCallback(() => {
    if (searchResults.length > 0) setShowSuggestions(true);
  }, [searchResults.length]);

  const handleBlur = useCallback(
    () => setTimeout(() => setShowSuggestions(false), 200),
    [],
  );

  const handleQueryChange = useCallback((q: string) => {
    setSearchQuery(q);
    setHasInteracted(true);
  }, []);

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
