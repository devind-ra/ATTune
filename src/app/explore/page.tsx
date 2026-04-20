// Explore Page
// Contains the following:
// - Calls DiscoveryCarousel for tag discovery via useExploreData hook
// - Calls TrendingTracks for global trending tracks
// - Calls CountryTopArtists for top artists by country

"use client";

import Navbar from "@/components/navbar/Navbar";
import { useExploreData } from "@/app/hooks/useExploreData";
import { DiscoverAlbums } from "@/components/explore/DiscoverAlbums";
import { TrendingTracks } from "@/components/explore/TrendingTracks";
import { GeoTopArtists } from "@/components/explore/GeoTopArtists";

// eslint-disable-next-line max-lines-per-function
export default function ExplorePage() {
  const { discoveryData, topTracks, isReady } = useExploreData();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen  ">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-sky-500/30 pb-20">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />

        <header className="mb-12 mt-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Explore
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl">
            Expand your taste profile. Discover trending tracks globally,
            explore brand new genres, and see what the rest of the world is
            listening to.
          </p>
        </header>

        <div className="flex flex-col gap-16">
          <section>
            <DiscoverAlbums data={discoveryData} />
          </section>

          <div className="border-t border-zinc-800" />

          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="p-2 bg-sky-900/30 text-sky-400 font-bold rounded-lg shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </span>
              <div>
                <h2 className="text-2xl font-bold text-zinc-100">
                  Trending Globally
                </h2>
                <p className="text-zinc-400 text-sm">
                  The most scrobbled tracks in the world right now.
                </p>
              </div>
            </div>
            {topTracks.length > 0 ? (
              <TrendingTracks tracks={topTracks} />
            ) : (
              <p className="text-zinc-500 text-sm">
                Loading trending tracks...
              </p>
            )}
          </section>

          <div className="border-t border-zinc-800" />

          <section>
            <GeoTopArtists />
          </section>
        </div>
      </main>
    </div>
  );
}
