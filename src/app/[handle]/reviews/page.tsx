// Other User's Reviews Page
// Contains the following:
// - Displaying user reviews retrieved from useOtherProfilePage hook
// - Filtering reviews based on options
// - Displaying comment modal for viewing comments

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Link from "next/link";
import { useOtherProfilePage } from "@/app/hooks/useOtherProfilePage";
import { SortOption } from "@/app/hooks/useReviews";
import ReviewItem from "@/components/review/ReviewItem";
import { CommentModal } from "@/components/review/CommentModal";
import { useReviewInteractions } from "@/app/hooks/useReviewInteractions";
import { compareReviews } from "@/lib/utils";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "date-desc", label: "Latest Listened" },
  { value: "date-asc", label: "Earliest Listened" },
  { value: "rating-desc", label: "Highest Rated" },
  { value: "rating-asc", label: "Lowest Rated" },
];

export default function HandleReviewsPage() {
  const { handle } = useParams<{ handle: string }>();
  const { allReviews, isLoadingProfile, refreshReviews, session } =
    useOtherProfilePage(handle);
  const [filterSortBy, setFilterSortBy] = useState<SortOption>("date-desc");
  const isReadOnly = session?.handle !== handle;
  const { selectedReview, setSelectedReview, handleDelete, handleEdit } =
    useReviewInteractions(allReviews, refreshReviews);
  const sortedReviews = [...allReviews].sort((a, b) =>
    compareReviews(a, b, filterSortBy),
  );

  if (isLoadingProfile)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );

  const interactionProps = {
    onDelete: handleDelete,
    onEdit: handleEdit,
    isReadOnly,
  };

  return (
    <div className="min-h-screen font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />
        <Link
          href={`/profile/${handle}`}
          className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
        >
          ← Back to {handle}&apos;s Profile
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-2">
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            All Reviews
            <span className="text-xs font-normal px-2 py-1 bg-zinc-800 rounded-full text-zinc-500">
              {handle}
            </span>
          </h2>
          <select
            value={filterSortBy}
            onChange={(e) => setFilterSortBy(e.target.value as SortOption)}
            className="bg-zinc-800 py-1.5 px-3 border border-zinc-700 text-zinc-100 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 focus:outline-none"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {sortedReviews.length > 0 ? (
          <div className="space-y-4">
            {sortedReviews.map((review) => (
              <ReviewItem
                key={review.uri}
                item={review}
                {...interactionProps}
                onClick={() => setSelectedReview(review)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center mt-20">
            <h1 className="text-2xl font-bold text-zinc-100">No Reviews Yet</h1>
            <p className="text-zinc-400 mt-2">
              {handle} hasn&apos;t shared any reviews yet.
            </p>
          </div>
        )}

        {selectedReview && (
          <CommentModal
            item={selectedReview}
            onClose={() => setSelectedReview(null)}
            {...interactionProps}
          />
        )}
      </main>
    </div>
  );
}
