// TastesPanel component
// Contains the following:
// - Calls to TastesEditor for editing tastes
// - Calls to TastesViewer for viewing tastes
// - Handles editing and saving tastes

import { TastesEditor } from "./TastesEditor";
import { TastesViewer } from "./TastesViewer";
import { UserTastes } from "@/lib/atproto";

// props used to handle tastes panel
interface Props {
  isReadonly?: boolean;
  tastes: UserTastes | null;
  isEditingTastes?: boolean;
  setIsEditingTastes?: (val: boolean) => void;
  editArtists: string[];
  editGenres: string[];
  onArtistChange: (idx: number, val: string) => void;
  onGenreChange: (idx: number, val: string) => void;
  artistExcludeValues: string[][];
  genreExcludeValues: string[][];
  isSaving?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}

export function TastesPanel({
  isReadonly,
  isEditingTastes,
  setIsEditingTastes,
  tastes,
  ...editorProps
}: Props) {
  // content called to display user tastes using either TastesEditor or TastesViewer
  // if content is ReadOnly edit tastes button is not displayed
  // if content is on a users own profile, edit tastes button is displayed
  return (
    <div className="mt-8 p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-100">Music Tastes</h2>
        {!isReadonly && !isEditingTastes && setIsEditingTastes && (
          <button
            onClick={() => setIsEditingTastes(true)}
            aria-label="Edit tastes"
            className="text-sm px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Edit Tastes
          </button>
        )}
      </div>
      {isEditingTastes && !isReadonly ? (
        <TastesEditor
          editArtists={editorProps.editArtists!}
          editGenres={editorProps.editGenres!}
          onArtistChange={editorProps.onArtistChange!}
          onGenreChange={editorProps.onGenreChange!}
          artistExcludeValues={editorProps.artistExcludeValues!}
          genreExcludeValues={editorProps.genreExcludeValues!}
          isSaving={editorProps.isSaving!}
          onSave={editorProps.onSave!}
          onCancel={editorProps.onCancel!}
        />
      ) : (
        <TastesViewer tastes={tastes} />
      )}
    </div>
  );
}
