// SuggestionList Component
// Contains the following:
// - Displays search results for albums and artists in list form
// - Allows for selection of results

interface SuggestionListProps {
  isSearching: boolean;
  searchResults: string[];
  searchQuery: string;
  onSelect: (s: string) => void;
}

export function SuggestionList({
  isSearching,
  searchResults,
  searchQuery,
  onSelect,
}: SuggestionListProps) {
  if (isSearching) {
    return (
      <li className="p-3 flex justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600" />
      </li>
    );
  }

  if (searchResults.length > 0) {
    return (
      <>
        {searchResults.map((s, idx) => (
          <li
            key={idx}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(s);
            }}
            className="p-2 hover:bg-zinc-700 cursor-pointer text-zinc-100 text-sm"
          >
            {s}
          </li>
        ))}
      </>
    );
  }

  if (searchQuery.trim().length > 2) {
    return <li className="p-2 text-zinc-500 text-sm">No results found</li>;
  }

  return null;
}
