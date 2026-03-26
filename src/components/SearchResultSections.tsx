// SearchResultSections component
// Contains the following:
// - Receives search results from useSearch hook
// - Displays search results in a structured format

import { LastFMArtist, LastFMAlbum } from "@/lib/lastfm";
import { ArtistList } from "./ArtistList";
import { AlbumList } from "@/components/AlbumList";

interface SearchResultSectionsProps {
  artists: LastFMArtist[];
  albums: LastFMAlbum[];
  primaryResultType: "artist" | "album";
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
      {children}
    </h3>
  );
}

function ArtistSection({ artists }: { artists: LastFMArtist[] }) {
  return (
    <section>
      <SectionHeading>Artists</SectionHeading>
      <ArtistList artists={artists} />
    </section>
  );
}

function AlbumSection({ albums }: { albums: LastFMAlbum[] }) {
  return (
    <section>
      <SectionHeading>Albums</SectionHeading>
      <AlbumList albums={albums} />
    </section>
  );
}

export function SearchResultSections({
  artists,
  albums,
  primaryResultType,
}: SearchResultSectionsProps) {
  const artistSection = <ArtistSection artists={artists} />;
  const albumSection = <AlbumSection albums={albums} />;
  const sections =
    primaryResultType === "artist"
      ? [artistSection, albumSection]
      : [albumSection, artistSection];

  return (
    <div className="space-y-12">
      {sections.map((section, idx) => (
        <div key={idx}>{section}</div>
      ))}
    </div>
  );
}
