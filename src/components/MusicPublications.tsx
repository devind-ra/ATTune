// MusicPublications component
// Contains the following:
// - Displays a list of music publications on Bluesky in a grid
// - Links to their Bluesky profile and displays their avatar and name

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AppBskyActorDefs } from "@atproto/api";
import { atApiService } from "@/lib/atproto";

const PUBLICATIONS = [
  "pitchfork.com",
  "stereogum.com",
  "thelineofbestfit.com",
  "mojomagazine.bsky.social",
];
const getOrderedProfiles = (
  profiles: AppBskyActorDefs.ProfileViewDetailed[],
  handles: string[],
) => {
  return handles
    .map((handle) => profiles.find((p) => p.handle === handle))
    .filter((p): p is AppBskyActorDefs.ProfileViewDetailed => p !== undefined);
};

function PublicationCard({
  profile,
}: {
  profile: AppBskyActorDefs.ProfileViewDetailed;
}) {
  return (
    <li className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center transition-all hover:opacity-80 hover:bg-zinc-800 relative group">
      <a
        href={`https://bsky.app/profile/${profile.handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 rounded-xl z-10"
        aria-label={`View ${profile.handle}'s profile on Bluesky`}
      />
      <div className="flex flex-col items-center gap-3 z-0 relative pointer-events-none w-full min-w-0 text-center">
        {profile.avatar ? (
          <Image
            src={profile.avatar}
            alt={`${profile.displayName || profile.handle} avatar`}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover border border-zinc-700 shadow-sm"
            unoptimized
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl font-bold text-zinc-400">
            {(profile.displayName || profile.handle).charAt(0)}
          </div>
        )}
        <div className="flex flex-col overflow-hidden min-w-0 w-full">
          <span className="font-medium text-zinc-100 truncate block group-hover:text-sky-400 transition-colors">
            {profile.displayName || profile.handle}
          </span>
          <span className="text-xs text-zinc-400 truncate block mt-0.5">
            @{profile.handle}
          </span>
        </div>
      </div>
    </li>
  );
}

export function MusicPublications() {
  const [profiles, setProfiles] = useState<
    AppBskyActorDefs.ProfileViewDetailed[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const res = await atApiService.agent.getProfiles({
          actors: PUBLICATIONS,
        });
        setProfiles(getOrderedProfiles(res.data.profiles, PUBLICATIONS));
      } catch (err) {
        console.error("Failed to fetch publication profiles", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );
  }

  if (profiles.length === 0) {
    return null;
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {profiles.map((profile) => (
        <PublicationCard key={profile.did} profile={profile} />
      ))}
    </ul>
  );
}
