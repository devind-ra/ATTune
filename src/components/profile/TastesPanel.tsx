// TastesPanel component
// Contains the following:
// - Calls to TastesEditor for editing tastes
// - Calls to TastesViewer for viewing tastes
// - Handles editing and saving tastes

import { TastesEditor } from "./TastesEditor";
import { TastesViewer } from "./TastesViewer";
import { UserTastes } from "@/lib/atproto";

interface Props {
  tastes: UserTastes | null;
  isEditingTastes: boolean;
  setIsEditingTastes: (val: boolean) => void;
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

export function TastesPanel({
  isEditingTastes,
  setIsEditingTastes,
  tastes,
  ...editorProps
}: Props) {
  return (
    <div className="mt-8 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Music Tastes
        </h2>
        {!isEditingTastes && (
          <button
            onClick={() => setIsEditingTastes(true)}
            className="text-sm px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Edit Tastes
          </button>
        )}
      </div>
      {isEditingTastes ? (
        <TastesEditor {...editorProps} />
      ) : (
        <TastesViewer tastes={tastes} />
      )}
    </div>
  );
}
