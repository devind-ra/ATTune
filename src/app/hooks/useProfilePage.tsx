// useProfilePage hook
// Contains the following:
// - Deals with profile page logic
// - Fetches profile information

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { atApiService } from "../../lib/atproto";
import { AppBskyActorDefs } from "@atproto/api";
import { useProfileReviews } from "./useProfileReviews";
import { useProfileTastes } from "./useProfileTastes";

export function useProfilePage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] =
    useState<AppBskyActorDefs.ProfileViewDetailed | null>(null);

  const {
    thisYearReviewCount,
    recentReviews,
    allReviews,
    refresh: refreshReviews,
  } = useProfileReviews(session?.did);
  const tastesData = useProfileTastes(session?.did);

  useEffect(() => {
    if (!isLoading && !session) router.push("/");
  }, [session, isLoading, router]);

  useEffect(() => {
    if (!session) return;
    atApiService.agent
      .getProfile({ actor: session.did })
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Error fetching profile:", err));
  }, [session]);

  return {
    session,
    isLoading,
    profile,
    thisYearReviewCount,
    recentReviews,
    allReviews,
    refreshReviews,
    ...tastesData,
  };
}
