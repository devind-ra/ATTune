// SearchResultSections component
// Contains the following:
// - Receives search results from useSearch hook
// - Displays search results in a structured format

import { LastFMArtist, LastFMAlbum } from "@/lib/lastfm";
import { AppBskyActorDefs } from "@atproto/api";
import { ArtistList } from "./ArtistList";
import { AlbumList } from "@/components/AlbumList";
import { UserList } from "@/components/UserList";

// props passed to search result sections
interface SearchResultSectionsProps {
  artists: LastFMArtist[];
  albums: LastFMAlbum[];
  users: AppBskyActorDefs.ProfileViewBasic[];
  primaryResultType: "artist" | "album";
}

// helper function used to display each section headings
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold mb-4 text-white border-b border-zinc-800 pb-2">
      {children}
    </h3>
  );
}

// helper function used to display artists with their relevant SectionHeading and artists
function ArtistSection({ artists }: { artists: LastFMArtist[] }) {
  return (
    <section>
      <SectionHeading>Artists</SectionHeading>
      <ArtistList artists={artists} />
    </section>
  );
}

// helper function used to display albums with their relevant SectionHeading and albums
function AlbumSection({ albums }: { albums: LastFMAlbum[] }) {
  return (
    <section>
      <SectionHeading>Albums</SectionHeading>
      <AlbumList albums={albums} />
    </section>
  );
}

// helper function used to display users with their relevant SectionHeading and users
function UserSection({
  users,
}: {
  users: AppBskyActorDefs.ProfileViewBasic[];
}) {
  if (users.length === 0) return null;
  return (
    <section>
      <SectionHeading>Users</SectionHeading>
      <UserList users={users} />
    </section>
  );
}

export function SearchResultSections({
  artists,
  albums,
  users,
  primaryResultType,
}: SearchResultSectionsProps) {
  // constants used to display sections in order required based on primaryResultType
  const artistSection = <ArtistSection artists={artists} />;
  const albumSection = <AlbumSection albums={albums} />;
  const userSection = <UserSection users={users} />;
  const sections =
    primaryResultType === "artist"
      ? [artistSection, albumSection, userSection]
      : [albumSection, artistSection, userSection];

  // content called with mapped sections
  return (
    <div className="space-y-12">
      {sections.map((section, idx) => (
        <div key={idx}>{section}</div>
      ))}
    </div>
  );
}
