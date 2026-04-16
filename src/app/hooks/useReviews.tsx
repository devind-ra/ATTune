// useReviews Hooks
// Contains the following:
// - Hook to fetch reviews for a user
// - Returns reviews sorted by date

import { useState, useCallback, useEffect } from "react";
import { atApiService, MusicReview } from "@/lib/atproto";
import { compareReviews } from "@/lib/utils";

export type SortOption =
  | "date-desc"
  | "date-asc"
  | "rating-desc"
  | "rating-asc";

export interface UseReviewsProps {
  did: string;
  refreshTrigger: number;
  filterTitle?: string;
  filterArtist?: string;
  sortBy?: SortOption;
}

export function useReviews({
  did,
  refreshTrigger,
  filterTitle,
  filterArtist,
  sortBy = "date-desc",
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

      const sorted = filtered.sort((a, b) => compareReviews(a, b, sortBy));

      setReviews(sorted);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [did, filterTitle, filterArtist, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshTrigger]);

  return {
    reviews,
    loading,
    refresh: fetchReviews,
  };
}
