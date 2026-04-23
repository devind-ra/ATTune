// Home Page
// Contains the following:
// - Specifies the content for the home page
// - Calls the useHomeData hook to retrieve data
// - Displays the content in the form of sections

"use client";

import Navbar from "@/components/navbar/Navbar";
import { ArtistList } from "@/components/ArtistList";
import { AlbumList } from "@/components/AlbumList";
import { SectionFilter } from "@/components/SectionFilter";
import { useHomeData } from "@/app/hooks/useHomeData";
import { useVisibleSections } from "@/lib/sections";
import { ALL_SECTIONS, SectionId } from "@/lib/sections";
import { MusicPublications } from "@/components/MusicPublications";

export default function HomePage() {
  const { recommendedArtists, recommendedAlbums, tagArtists, isReady } =
    useHomeData();
  const { visibleSections, toggleSection } = useVisibleSections();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );
  }

  const sectionContent: Record<SectionId, React.ReactNode> = {
    recommendedAlbums: <AlbumList albums={recommendedAlbums} enableShuffle />,
    recommendedArtists: <ArtistList artists={recommendedArtists} />,
    tagArtists: <ArtistList artists={tagArtists} />,
    musicPublications: <MusicPublications />,
  };

  return (
    <div className="min-h-screen font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />
        <SectionFilter
          visibleSections={visibleSections}
          onToggle={toggleSection}
        />
        {ALL_SECTIONS.filter((s) => visibleSections.has(s.id)).map(
          ({ id, label }) => (
            <section key={id} className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-zinc-100">
                {label}
              </h2>
              {sectionContent[id]}
            </section>
          ),
        )}
      </main>
    </div>
  );
}
