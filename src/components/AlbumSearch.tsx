// AlbumSearch Component
// Contains the following:
// - Called by ReviewForm component to search for albums
// - Displays album search results and buttons associated with selection

import Image from "next/image";
import { LastFMAlbum, LastFMImage } from "../lib/lastfm";
import { getArtistName } from "~/lib/utils";

interface AlbumSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: LastFMAlbum[];
  isSearching: boolean;
  onSelectAlbum: (album: LastFMAlbum) => void;
  getImageUrl: (images: LastFMImage[] | undefined, size?: string) => string;
}

// eslint-disable-next-line max-lines-per-function
function SearchResults({
  searchQuery,
  searchResults,
  isSearching,
  onSelectAlbum,
  getImageUrl,
}: Omit<AlbumSearchProps, "onSearchChange">) {
  if (isSearching) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600" />
      </div>
    );
  }

  if (searchResults.length > 0) {
    return (
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {searchResults.map((album, idx) => {
          const imgUrl = getImageUrl(album.image, "large");
          return (
            <li
              key={idx}
              onClick={() => onSelectAlbum(album)}
              className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-sky-500 dark:hover:border-sky-500 hover:shadow-md transition-all group"
            >
              <div className="shrink-0">
                {imgUrl ? (
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                    <Image
                      src={imgUrl}
                      alt={album.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-md bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-zinc-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7.5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {album.name}
                </span>
                <span className="text-xs text-zinc-500 truncate">
                  {getArtistName(album.artist)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  if (searchQuery.trim().length > 2) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">
        No albums found for &quot;{searchQuery}&quot;
      </div>
    );
  }

  return (
    <div className="text-center py-8 text-zinc-500 text-sm">
      Start typing to search for an album to review
    </div>
  );
}

export function AlbumSearch(props: AlbumSearchProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
          Search Album
        </label>
        <div className="relative">
          <input
            type="text"
            value={props.searchQuery}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="Type an album name..."
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-zinc-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="min-h-[200px]">
        <SearchResults {...props} />
      </div>
    </div>
  );
}
