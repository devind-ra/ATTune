// useOtherProfilePage hook
// Contains the following:
// - Fetches other user's profile
// - Handles following/unfollowing

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { atApiService } from "@/lib/atproto";
import { AppBskyActorDefs } from "@atproto/api";
import { useProfileReviews } from "./useProfileReviews";
import { useProfileTastes } from "./useProfileTastes";

// eslint-disable-next-line max-lines-per-function
export function useOtherProfilePage(handle: string) {
  const { session, isLoading: authLoading } = useAuth();
  const [profile, setProfile] =
    useState<AppBskyActorDefs.ProfileViewDetailed | null>(null);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const did = profile?.did;

  const {
    thisYearReviewCount,
    recentReviews,
    allReviews,
    refresh: refreshReviews,
  } = useProfileReviews(did);

  const tastesData = useProfileTastes(did);

  const fetchProfile = useCallback(() => {
    setIsLoadingProfile(true);
    const decodedHandle = decodeURIComponent(handle);
    atApiService.agent
      .getProfile({ actor: decodedHandle })
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Error fetching other profile:", err))
      .finally(() => setIsLoadingProfile(false));
  }, [handle]);

  const syncProfile = useCallback(() => {
    setTimeout(async () => {
      try {
        const res = await atApiService.agent.getProfile({ actor: handle });
        setProfile((prev) => {
          if (!prev) return res.data;
          const currentFollowing = !!prev.viewer?.following;
          const fetchedFollowing = !!res.data.viewer?.following;

          if (currentFollowing !== fetchedFollowing) {
            return {
              ...res.data,
              viewer: prev.viewer,
              followersCount: prev.followersCount,
            };
          }
          return res.data;
        });
      } catch (err) {
        console.error("Sync Error:", err);
      }
    }, 3000);
  }, [handle]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const toggleFollow = useCallback(async () => {
    if (!profile || !session) return;

    const isFollowing = !!profile.viewer?.following;
    const followingUri = profile.viewer?.following;

    setIsFollowingLoading(true);
    try {
      if (isFollowing && followingUri) {
        setProfile((prev) =>
          prev
            ? {
              ...prev,
              viewer: { ...prev.viewer, following: undefined },
              followersCount: Math.max(0, (prev.followersCount ?? 1) - 1),
            }
            : null,
        );
        await atApiService.unfollowUser(followingUri);
      } else {
        const res = await atApiService.followUser(profile.did);
        setProfile((prev) =>
          prev
            ? {
              ...prev,
              viewer: { ...prev.viewer, following: res.uri },
              followersCount: (prev.followersCount ?? 0) + 1,
            }
            : null,
        );
      }
      syncProfile();
    } catch (err) {
      console.error("Error toggling follow:", err);
      fetchProfile();
    } finally {
      setIsFollowingLoading(false);
    }
  }, [profile, session, fetchProfile, syncProfile]);

  return {
    session,
    authLoading,
    isLoadingProfile,
    profile,
    thisYearReviewCount,
    recentReviews,
    allReviews,
    refreshReviews,
    tastes: tastesData.tastes,
    toggleFollow,
    isFollowingLoading,
  };
}
