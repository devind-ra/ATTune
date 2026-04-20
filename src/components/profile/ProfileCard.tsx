// ProfileCard component
// Contains the following:
// - Displays user profile information
// - Calls to ProfileAvatar for displaying user avatar
// - Displays user stats

import Image from "next/image";
import { AppBskyActorDefs } from "@atproto/api";

interface Props {
  profile: AppBskyActorDefs.ProfileViewDetailed;
  thisYearReviewCount: number;
}

function ProfileAvatar({
  profile,
}: {
  profile: AppBskyActorDefs.ProfileViewDetailed;
}) {
  const initial = profile.displayName?.charAt(0) ?? profile.handle.charAt(0);
  if (profile.avatar) {
    return (
      <Image
        src={profile.avatar}
        alt="Avatar"
        width={80}
        height={80}
        className="w-24 h-24 rounded-full object-cover border-2 border-zinc-800"
        unoptimized
      />
    );
  }
  return (
    <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-400">
      {initial}
    </div>
  );
}

export function ProfileCard({ profile, thisYearReviewCount }: Props) {
  const reviewLabel = thisYearReviewCount === 1 ? "Review" : "Reviews";
  return (
    <div className="mt-8 p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <ProfileAvatar profile={profile} />
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-zinc-100 mb-1">
            {profile.displayName || profile.handle}
          </h1>
          <p className="text-zinc-400 mb-4">
            @{profile.handle}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-sm mt-4">
            <div className="bg-sky-900/20 text-sky-400 px-3 py-1 rounded-full font-medium">
              {thisYearReviewCount} {reviewLabel} this year
            </div>
            <div className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full font-medium">
              {profile.followersCount ?? 0} Followers
            </div>
            <div className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full font-medium">
              {profile.followsCount ?? 0} Following
            </div>
          </div>
        </div>
      </div>
      {profile.description && (
        <p className="mt-6 whitespace-pre-wrap text-zinc-300">
          {profile.description}
        </p>
      )}
    </div>
  );
}
