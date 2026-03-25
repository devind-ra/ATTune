// AutocompleteInput Component
// Contains the following:
// - Deals with suggestions for albums and artists
// - Calls to useAutocomplete hook for logic
// - Calls to SuggestionList for displaying suggestions

import { useAutocomplete } from "@/app/hooks/useAutocomplete";
import { SuggestionList } from "./SuggestionList";

interface AutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  fetchSuggestions: (q: string) => Promise<string[]>;
  excludeValues?: string[];
}

export function AutocompleteInput(props: AutocompleteInputProps) {
  const {
    searchQuery,
    searchResults,
    isSearching,
    showSuggestions,
    handleSelect,
    handleFocus,
    handleBlur,
    handleQueryChange,
  } = useAutocomplete(props);

  return (
    <div className="relative flex-1">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleQueryChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={props.placeholder}
        className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-sky-500 outline-none"
      />
      {showSuggestions && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-48 overflow-auto">
          <SuggestionList
            isSearching={isSearching}
            searchResults={searchResults}
            searchQuery={searchQuery}
            onSelect={handleSelect}
          />
        </ul>
      )}
    </div>
  );
}
