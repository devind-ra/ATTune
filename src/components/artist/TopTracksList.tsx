// TopTracksList component
// Contains the following:
// - Displays top tracks in a list

import { LastFMTrack } from "@/lib/lastfm";
import { getArtistName } from "@/lib/utils";

export function TopTracksList({ tracks }: { tracks: LastFMTrack[] }) {
  if (!tracks.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-zinc-100 mb-6">
        Top Tracks
      </h2>
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
        <ul className="divide-y divide-zinc-800">
          {tracks.map((track, idx) => (
            <li
              key={idx}
              className="flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-colors"
            >
              <span className="w-6 text-center font-medium text-zinc-400">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-100 truncate">
                  {track.name}
                </p>
                <p className="text-sm text-zinc-400 truncate">
                  {getArtistName(track.artist)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
