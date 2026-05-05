// ProfileCard component
// Contains the following:
// - Displays user profile information
// - Calls to ProfileAvatar for displaying user avatar
// - Displays user stats

import Image from "next/image";
import { AppBskyActorDefs } from "@atproto/api";

// props for ProfileCard component
interface Props {
  profile: AppBskyActorDefs.ProfileViewDetailed;
  thisYearReviewCount: number;
  isOtherUser?: boolean;
  isFollowingLoading?: boolean;
  onFollowToggle?: () => void;
}

// helper function for the ProfileAvatar to be added to the ProfileCard
// utilises the avatar of the user or uses an initial if no avatar is found
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

// helper function used to allow for follow and unfollowing
// used when a user visits other users profiles
function FollowButton({
  isFollowingLoading,
  isFollowing,
  onFollowToggle,
}: {
  isFollowingLoading?: boolean;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
}) {
  let label = "Follow";
  if (isFollowingLoading) {
    label = "...";
  } else if (isFollowing) {
    label = "Unfollow";
  }

  const baseClass =
    "px-6 py-2 rounded-full font-medium transition-colors cursor-pointer disabled:opacity-50";
  const followingClass =
    "bg-zinc-800 hover:bg-red-900/30 text-zinc-100 hover:text-red-400 hover:border-red-900/50 border border-transparent";
  const notFollowingClass = "bg-sky-600 hover:bg-sky-500 text-white";

  return (
    <button
      onClick={onFollowToggle}
      disabled={isFollowingLoading}
      className={`${baseClass} ${isFollowing ? followingClass : notFollowingClass}`}
    >
      {label}
    </button>
  );
}

export function ProfileCard({
  profile,
  thisYearReviewCount,
  isOtherUser,
  isFollowingLoading,
  onFollowToggle,
}: Props) {
  // changes label based on if the number of reviews is singular or multiple
  const reviewLabel = thisYearReviewCount === 1 ? "Review" : "Reviews";
  // content called to link the ProfileAvatar and FollowButton to the main ProfileCard
  // content also includes the user's name, followers, following and description
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
              <FollowButton
                isFollowingLoading={isFollowingLoading}
                isFollowing={!!profile.viewer?.following}
                onFollowToggle={onFollowToggle}
              />
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
