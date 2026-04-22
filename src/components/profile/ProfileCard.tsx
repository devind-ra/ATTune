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
  isOtherUser?: boolean;
  isFollowingLoading?: boolean;
  onFollowToggle?: () => void;
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

export function ProfileCard({
  profile,
  thisYearReviewCount,
  isOtherUser,
  isFollowingLoading,
  onFollowToggle,
}: Props) {
  const reviewLabel = thisYearReviewCount === 1 ? "Review" : "Reviews";
  return (
    <div className="mt-8 p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm relative">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <ProfileAvatar profile={profile} />
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">
            <h1 className="text-3xl font-bold text-zinc-100">
              {profile.displayName || profile.handle}
            </h1>
            {isOtherUser && onFollowToggle && (
              <button
                onClick={onFollowToggle}
                disabled={isFollowingLoading}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${profile.viewer?.following
                  ? "bg-zinc-800 hover:bg-red-900/30 text-zinc-100 hover:text-red-400 hover:border-red-900/50 border border-transparent cursor-pointer"
                  : "bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
                  } disabled:opacity-50`}
              >
                {isFollowingLoading
                  ? "..."
                  : profile.viewer?.following
                    ? "Unfollow"
                    : "Follow"}
              </button>
            )}
          </div>
          <p className="text-zinc-400 mb-4">@{profile.handle}</p>
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
