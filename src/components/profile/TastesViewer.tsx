// TastesViewer Component
// Contains the following:
// - Displays user's tastes (top artists and genres)
// - Calls to Link for linking to artist/album pages

import Link from "next/link";
import { UserTastes } from "@/lib/atproto";

export function TastesViewer({ tastes }: { tastes: UserTastes | null }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">
          Top Artists
        </h3>
        {tastes?.topArtists?.length ? (
          <ul className="space-y-2">
            {tastes.topArtists.map((artist, idx) => (
              <li key={idx} className="flex items-center gap-3 text-zinc-200">
                <span className="w-6 text-center font-medium text-sky-500">
                  {idx + 1}.
                </span>
                <Link
                  href={`/artist/${encodeURIComponent(artist)}`}
                  className="font-medium hover:text-sky-400 hover:bg-sky-900/20 px-2 py-1 -mx-2 rounded transition-colors"
                >
                  {artist}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-400 italic">No artists added yet.</p>
        )}
      </div>
      <div>
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">
          Top Genres
        </h3>
        {tastes?.topGenres?.length ? (
          <div className="flex flex-wrap gap-2">
            {tastes.topGenres.map((genre, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm font-medium border border-zinc-700"
              >
                {genre}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-zinc-400 italic">No genres added yet.</p>
        )}
      </div>
    </div>
  );
}
