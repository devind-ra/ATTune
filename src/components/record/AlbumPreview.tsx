// AlbumPreview component
// Contains the following:
// - Displays album image, title and artist
// - Displays a button to change the album

import Image from "next/image";

interface Props {
  title: string;
  artist: string;
  albumImage: string;
  showChangeAlbum: boolean;
  onBackToSearch: () => void;
}

const MusicPlaceholder = () => (
  <div className="w-20 h-20 rounded-md bg-zinc-700 flex items-center justify-center shadow-sm">
    <svg
      className="w-8 h-8 text-zinc-400"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7.5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  </div>
);

export function AlbumPreview({
  title,
  artist,
  albumImage,
  showChangeAlbum,
  onBackToSearch,
}: Props) {
  return (
    <div className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
      <div className="shrink-0">
        {albumImage ? (
          <div className="relative w-20 h-20 rounded-md overflow-hidden bg-zinc-700 shadow-sm">
            <Image
              src={albumImage}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <MusicPlaceholder />
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0 pt-1">
        <h3 className="font-bold text-lg text-zinc-100 truncate">{title}</h3>
        <p className="text-zinc-500 text-sm truncate mb-2">{artist}</p>
        {showChangeAlbum && (
          <button
            type="button"
            onClick={onBackToSearch}
            className="text-xs font-medium text-sky-600 text-sky-400 hover:text-sky-300 w-fit cursor-pointer"
          >
            Change Album
          </button>
        )}
      </div>
    </div>
  );
}
