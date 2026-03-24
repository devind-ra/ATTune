// TastesEditor Component
// Contains the following:
// - Deals with fetching artist and genre suggestions
// - Calls to AutocompleteInput for displaying suggestions
// - Displays artists and genres in a list
// - Handles saving user tastes

import {
  LastFMArtist,
  LastFMTag,
  getTopTags,
  searchArtist,
} from "@/lib/lastfm";
import { AutocompleteInput } from "./AutocompleteInput";

interface TastesEditorProps {
  editArtists: string[];
  editGenres: string[];
  onArtistChange: (idx: number, val: string) => void;
  onGenreChange: (idx: number, val: string) => void;
  artistExcludeValues: string[][];
  genreExcludeValues: string[][];
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const fetchArtistSuggestions = async (q: string): Promise<string[]> => {
  const res = await searchArtist(q);
  return res.slice(0, 5).map((a: LastFMArtist) => a.name);
};

const fetchGenreSuggestions = async (q: string): Promise<string[]> => {
  const res = await getTopTags("200");
  return res
    .filter((t: LastFMTag) => t.name.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 5)
    .map((t: LastFMTag) => t.name);
};

// eslint-disable-next-line max-lines-per-function
export function TastesEditor({
  editArtists,
  editGenres,
  onArtistChange,
  onGenreChange,
  artistExcludeValues,
  genreExcludeValues,
  isSaving,
  onSave,
  onCancel,
}: TastesEditorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">
          Top 5 Artists
        </h3>
        <div className="space-y-2">
          {editArtists.map((artist, idx) => (
            <div key={`artist-${idx}`} className="flex items-center gap-3">
              <span className="w-6 text-center font-medium text-zinc-400">
                {idx + 1}.
              </span>
              <AutocompleteInput
                value={artist}
                onChange={(val) => onArtistChange(idx, val)}
                placeholder="Artist Name"
                excludeValues={artistExcludeValues[idx]}
                fetchSuggestions={fetchArtistSuggestions}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">
          Top 3 Genres
        </h3>
        <div className="space-y-2">
          {editGenres.map((genre, idx) => (
            <div key={`genre-${idx}`} className="flex items-center gap-3">
              <span className="w-6 text-center font-medium text-zinc-400">
                {idx + 1}.
              </span>
              <AutocompleteInput
                value={genre}
                onChange={(val) => onGenreChange(idx, val)}
                placeholder="Genre Name"
                excludeValues={genreExcludeValues[idx]}
                fetchSuggestions={fetchGenreSuggestions}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? "Saving..." : "Save Tastes"}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
