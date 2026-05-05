// Explore Page
// Contains the following:
// - Calls DiscoveryAlbums for tag discovery via useExploreData hook
// - Calls TrendingTracks for global trending tracks
// - Calls TrendingArtists for global trending artists
// - Calls GeoTopArtists for top artists by country

"use client";

import React, { Fragment } from "react";
import Navbar from "@/components/navbar/Navbar";
import { useExploreData } from "@/app/hooks/useExploreData";
import { DiscoverAlbums } from "@/components/explore/DiscoverAlbums";
import { TrendingTracks } from "@/components/explore/TrendingTracks";
import { GeoTopArtists } from "@/components/explore/GeoTopArtists";
import { TrendingArtists } from "@/components/explore/TrendingArtists";
import { SectionFilter } from "@/components/SectionFilter";
import {
  useVisibleSections,
  EXPLORE_SECTIONS,
  ExploreSectionId,
} from "@/lib/sections";

// eslint-disable-next-line max-lines-per-function
export default function ExplorePage() {
  // constants storing data from hooks and sections
  // useExploreData hook used to retrieve data for Explore page
  // useVisibleSections hook retrieves content structure for Explore page
  const { discoveryData, topTracks, topArtists, isReady } = useExploreData();
  const { visibleSections, toggleSection } = useVisibleSections(
    EXPLORE_SECTIONS,
    "explore_sections",
  );

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen  ">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  // creates format for HTML content and styling for Explore Page
  const sectionContent: Record<ExploreSectionId, React.ReactNode> = {
    discoverAlbums: <DiscoverAlbums data={discoveryData} />,
    topArtists: (
      <>
        <h2 className="text-2xl font-bold text-zinc-100">
          Top Artists Globally
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          The most scrobbled artists in the world right now.
        </p>
        <TrendingArtists artists={topArtists} />
      </>
    ),
    trendingTracks: (
      <>
        <div className="flex items-center gap-2 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">
              Trending Tracks Globally
            </h2>
            <p className="text-zinc-400 text-sm">
              The most scrobbled tracks in the world right now.
            </p>
          </div>
        </div>
        {topTracks.length > 0 ? (
          <TrendingTracks tracks={topTracks} />
        ) : (
          <p className="text-zinc-500 text-sm">Loading trending tracks...</p>
        )}
      </>
    ),
    geoTopArtists: <GeoTopArtists />,
  };

  // content calling using sectionContent created and other text on page
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

        <SectionFilter
          sections={EXPLORE_SECTIONS}
          visibleSections={visibleSections}
          onToggle={toggleSection}
        />

        <div className="flex flex-col gap-16 mt-8">
          {EXPLORE_SECTIONS.filter((s) => visibleSections.has(s.id)).map(
            ({ id }, index, arr) => (
              <Fragment key={id}>
                <section>{sectionContent[id]}</section>
                {index < arr.length - 1 && (
                  <div className="border-t border-zinc-800" />
                )}
              </Fragment>
            ),
          )}
        </div>
      </main>
    </div>
  );
}
