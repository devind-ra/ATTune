// AutocompleteInput Component
// Contains the following:
// - Deals with suggestions for albums and artists
// - Calls to useAutocomplete hook for logic
// - Calls to SuggestionList for displaying suggestions

import { useAutocomplete } from "@/app/hooks/useAutocomplete";
import { SuggestionList } from "./SuggestionList";

// props used to ensure search suggestions are presented
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
  // content used to allow for user input and then present suggestions with SuggestionList
  return (
    <div className="relative flex-1">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleQueryChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={props.placeholder}
        className="w-full p-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-sky-500 outline-none"
      />
      {showSuggestions && (
        <ul className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-48 overflow-auto">
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
