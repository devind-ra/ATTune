"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/Navbar";
import {
  getTopArtists,
  getTopTracks,
  LastFMArtist,
  LastFMTrack,
} from "../../lib/lastfm";

export default function HomePage() {
  const router = useRouter();
  const { session, isLoading } = useAuth();
  const [topArtists, setTopArtists] = useState<LastFMArtist[]>([]);
  const [topTracks, setTopTracks] = useState<LastFMTrack[]>([]);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/");
    } else if (session) {
      getTopArtists("5").then(setTopArtists).catch(console.error);
      getTopTracks("5").then(setTopTracks).catch(console.error);
    }
  }, [session, isLoading, router]);

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />

        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            Current Top Artists
          </h2>
          {topArtists.length > 0 ? (
            <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {topArtists.map((artist, idx) => (
                <li
                  key={idx}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 text-center">
                    {artist.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="animate-pulse flex space-x-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl"
                ></div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            Current Top Tracks
          </h2>
          {topTracks.length > 0 ? (
            <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {topTracks.map((track, idx) => (
                <li
                  key={idx}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 text-center">
                    {track.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="animate-pulse flex space-x-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl"
                ></div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
