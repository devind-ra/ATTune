// useOtherReviews hook
// Contains the following:
// - Fetches other users' reviews for a given album and sorts them based on date

import { useState, useCallback, useEffect } from "react";
import { atApiService, ReviewRecord } from "@/lib/atproto";

export interface UseOtherReviewsProps {
  title: string;
  artist: string;
  currentUserDid: string;
  refreshTrigger?: number;
}

export function useOtherReviews({
  title,
  artist,
  currentUserDid,
  refreshTrigger = 0,
}: UseOtherReviewsProps) {
  // constants storing user review data
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // uses .getOtherReviews() from atApiService to fetch orther user reviews
  // error handling to ensure user reviews can be found
  const fetchReviews = useCallback(async () => {
    if (!title || !artist || !currentUserDid) return;

    try {
      setLoading(true);
      const fetchedReviews = await atApiService.getOtherReviews(
        title,
        artist,
        currentUserDid,
      );

      const sorted = fetchedReviews.sort((a, b) => {
        const timeA = new Date(
          a.value.listenedAt || a.value.createdAt,
        ).getTime();
        const timeB = new Date(
          b.value.listenedAt || b.value.createdAt,
        ).getTime();
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });

      setReviews(sorted);
    } catch (err) {
      console.error("Failed to fetch other reviews", err);
    } finally {
      setLoading(false);
    }
  }, [title, artist, currentUserDid]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshTrigger]);

  return {
    reviews,
    loading,
    refresh: fetchReviews,
  };
}
