// useReviews Hooks
// Contains the following:
// - Hook to fetch reviews for a user
// - Returns reviews sorted by date

import { useState, useCallback, useEffect } from "react";
import { atApiService, MusicReview } from "../../lib/atproto";

export interface UseReviewsProps {
  did: string;
  refreshTrigger: number;
  filterTitle?: string;
  filterArtist?: string;
}

export function useReviews({
  did,
  refreshTrigger,
  filterTitle,
  filterArtist,
}: UseReviewsProps) {
  const [reviews, setReviews] = useState<{ uri: string; value: MusicReview }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await atApiService.getReviews(did);

      const filtered = data.filter((item) => {
        const titleMatch =
          !filterTitle ||
          item.value.subjectTitle?.toLowerCase() === filterTitle.toLowerCase();
        const artistMatch =
          !filterArtist ||
          item.value.subjectArtist?.toLowerCase() ===
            filterArtist.toLowerCase();
        return titleMatch && artistMatch;
      });

      const sorted = filtered.sort((a, b) => {
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
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [did, filterTitle, filterArtist]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshTrigger]);

  return {
    reviews,
    loading,
    refresh: fetchReviews,
  };
}
