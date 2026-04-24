// useProfileReviews hook
// Contains the following:
// - Fetches user reviews
// - Calculates this year's review count

import { useState, useEffect, useCallback } from "react";
import { atApiService, MusicReview } from "@/lib/atproto";

function getReviewDate(r: { value: MusicReview }) {
  return new Date(r.value.listenedAt || r.value.createdAt);
}

export function useProfileReviews(did: string | undefined) {
  const [thisYearReviewCount, setThisYearReviewCount] = useState(0);
  const [recentReviews, setRecentReviews] = useState<
    { uri: string; value: MusicReview }[]
  >([]);
  const [allReviews, setAllReviews] = useState<
    { uri: string; value: MusicReview }[]
  >([]);

  const fetchReviews = useCallback(() => {
    if (!did) return;
    atApiService
      .getReviews(did)
      .then((reviews) => {
        const currentYear = new Date().getFullYear();
        setThisYearReviewCount(
          reviews.filter((r) => getReviewDate(r).getFullYear() === currentYear)
            .length,
        );
        setRecentReviews(
          [...reviews]
            .sort(
              (a, b) => getReviewDate(b).getTime() - getReviewDate(a).getTime(),
            )
            .slice(0, 2),
        );
        setAllReviews(reviews);
      })
      .catch((err) => console.error("Error fetching reviews:", err));
  }, [did]);

  useEffect(() => {
    if (did) {
      fetchReviews();
    }
  }, [did, fetchReviews]);

  return {
    thisYearReviewCount,
    recentReviews,
    allReviews,
    refresh: fetchReviews,
  };
}
