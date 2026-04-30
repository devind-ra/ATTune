// ArtistList Component
// Contains the following:
// - Receives list of artists from useSearch hook
// - Displays list of artists with artist name

import Link from "next/link";
import { LastFMArtist } from "@/lib/lastfm";

interface ArtistListProps {
  artists: LastFMArtist[];
}

function getArtistTextSize(name: string): string {
  if (name.length > 20) return "text-xs";
  if (name.length > 12) return "text-sm";
  return "text-base";
}

export function ArtistList({ artists }: ArtistListProps) {
  if (artists.length === 0) {
    return <p className="text-zinc-200 text-sm">No artists found.</p>;
  }

  return (
    <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {artists.map((artist, idx) => (
        <li
          key={idx}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow relative"
        >
          <Link
            href={`/artist/${encodeURIComponent(artist.name)}`}
            className="absolute inset-0 flex items-center justify-center rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <span
              className={`font-medium text-zinc-100 text-center hover:text-sky-400 ${getArtistTextSize(artist.name)}`}
            >
              {artist.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
