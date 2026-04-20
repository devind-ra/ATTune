// TrendingTracks Component
// Contains the following:
// - Displays global trending tracks
// - Allows user to navigate to artist page

import Link from "next/link";
import { LastFMTrack } from "@/lib/lastfm";
import { getArtistName } from "@/lib/utils";

interface TrendingTracksProps {
  tracks: LastFMTrack[];
}

export function TrendingTracks({ tracks }: TrendingTracksProps) {
  if (!tracks.length) {
    return <p className="text-zinc-500 text-sm">No trending tracks found.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {tracks.map((track, idx) => {
        const artistName = getArtistName(track.artist);

        return (
          <li
            key={`${track.name}-${artistName}`}
            className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="w-8 shrink-0 text-center font-bold text-zinc-500">
              {idx + 1}
            </div>

            <div className="flex flex-col flex-grow">
              <span className="font-semibold text-zinc-100 transition-colors">
                {track.name}
              </span>
              <span className="text-sm text-zinc-400 mt-0.5">
                <Link
                  href={`/artist/${encodeURIComponent(artistName)}`}
                  className="hover:text-sky-400 hover:bg-sky-900/20 px-1 -mx-1 rounded transition-colors inline-block"
                >
                  {artistName}
                </Link>
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
