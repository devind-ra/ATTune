// TrendingTracks Component
// Contains the following:
// - Displays global trending tracks
// - Allows user to navigate to artist page

import Link from "next/link";
import { LastFMArtist } from "@/lib/lastfm";
import { getArtistName } from "@/lib/utils";

interface TrendingArtistsProps {
  artists: LastFMArtist[];
}

export function TrendingArtists({ artists }: TrendingArtistsProps) {
  if (!artists.length) {
    return <p className="text-zinc-500 text-sm">No trending artists found.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {artists.map((artist, idx) => {
        const artistName = getArtistName(artist);

        return (
          <li
            key={`${artist.name}-${artistName}`}
            className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="w-8 shrink-0 text-center font-bold text-zinc-500">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/artist/${encodeURIComponent(artistName)}`}
                className="block font-semibold text-zinc-100 hover:underline truncate"
              >
                {artistName}
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
