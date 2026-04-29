// Explore Page
// Contains the following:
// - Calls DiscoveryCarousel for tag discovery via useExploreData hook
// - Calls TrendingTracks for global trending tracks
// - Calls CountryTopArtists for top artists by country

"use client";

import Navbar from "@/components/navbar/Navbar";
import { useExploreData } from "~/app/hooks/useExploreData";
import { DiscoverAlbums } from "@/components/explore/DiscoverAlbums";
import { TrendingTracks } from "@/components/explore/TrendingTracks";
import { GeoTopArtists } from "@/components/explore/GeoTopArtists";
import { TrendingArtists } from "~/components/explore/TrendingArtists";

// eslint-disable-next-line max-lines-per-function
export default function ExplorePage() {
  const { discoveryData, topTracks, topArtists, isReady } = useExploreData();

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
          <p className="text-lg text-zinc-200 max-w-2xl">
            Expand your taste profile. Discover trending tracks globally,
            explore brand new genres and see what the rest of the world is
            listening to.
          </p>
        </header>

        <div className="flex flex-col gap-16">
          <section>
            <DiscoverAlbums data={discoveryData} />
          </section>

          <div className="border-t border-zinc-800" />

          <section>
            <h2 className="text-2xl font-bold text-zinc-100">
              Top Artists Globally
            </h2>
            <p className="text-zinc-400 text-sm mb-6">
              The most scrobbled artists in the world right now.
            </p>
            <TrendingArtists artists={topArtists} />
          </section>

          <div className="border-t border-zinc-800" />

          <section>
            <div className="flex items-center gap-2 mb-6">
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
