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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const toggleFollow = useCallback(async () => {
    if (!profile || !session) return;
    setIsFollowingLoading(true);
    try {
      if (profile.viewer?.following) {
        await atApiService.unfollowUser(profile.viewer.following);
      } else {
        await atApiService.followUser(profile.did);
      }
      fetchProfile();
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setIsFollowingLoading(false);
    }
  }, [profile, session, fetchProfile]);

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
