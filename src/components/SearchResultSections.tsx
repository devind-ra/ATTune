// SearchResultSections component
// Contains the following:
// - Receives search results from useSearch hook
// - Displays search results in a structured format

import { LastFMArtist, LastFMAlbum } from "@/lib/lastfm";
import { AppBskyActorDefs } from "@atproto/api";
import { ArtistList } from "./ArtistList";
import { AlbumList } from "@/components/AlbumList";
import { UserList } from "@/components/UserList";

interface SearchResultSectionsProps {
  artists: LastFMArtist[];
  albums: LastFMAlbum[];
  users: AppBskyActorDefs.ProfileViewBasic[];
  primaryResultType: "artist" | "album";
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold mb-4 text-zinc-200 border-b border-zinc-800 pb-2">
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
  const artistSection = <ArtistSection artists={artists} />;
  const albumSection = <AlbumSection albums={albums} />;
  const userSection = <UserSection users={users} />;
  const sections =
    primaryResultType === "artist"
      ? [userSection, artistSection, albumSection]
      : [userSection, albumSection, artistSection];

  return (
    <div className="space-y-12">
      {sections.map((section, idx) => (
        <div key={idx}>{section}</div>
      ))}
    </div>
  );
}
