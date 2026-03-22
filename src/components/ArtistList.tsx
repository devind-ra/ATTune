// ArtistList Component
// Contains the following:
// - Receives list of artists from useSearch hook
// - Displays list of artists with artist name

import Link from "next/link";
import { LastFMArtist } from "../lib/lastfm";

interface ArtistListProps {
  artists: LastFMArtist[];
}

export function ArtistList({ artists }: ArtistListProps) {
  if (artists.length === 0) {
    return <p className="text-zinc-500 text-sm">No artists found.</p>;
  }

  return (
    <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {artists.map((artist, idx) => (
        <li
          key={idx}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow relative"
        >
          <Link
            href={`/artist/${encodeURIComponent(artist.name)}`}
            className="absolute inset-0 flex items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className="font-medium text-zinc-900 dark:text-zinc-100 text-center text-sm hover:text-sky-600 dark:hover:text-sky-400">
              {artist.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
