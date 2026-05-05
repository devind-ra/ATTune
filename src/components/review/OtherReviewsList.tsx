// OtherReviewsList component
// Contains the following:
// - Calls ReviewItem for read-only reviews
// - Calls CommentModal for displaying comments on reviews

"use client";

import { useOtherReviews } from "@/app/hooks/useOtherReviews";
import ReviewItem from "./ReviewItem";
import { CommentModal } from "./CommentModal";
import { useState } from "react";
import { MusicReview } from "@/lib/atproto";

// props for other reviews list component
interface OtherReviewsListProps {
  title: string;
  artist: string;
  currentUserDid: string;
  refreshTrigger?: number;
}

export default function OtherReviewsList(props: OtherReviewsListProps) {
  // constants to retrieve other user reviews
  const { reviews, loading } = useOtherReviews(props);
  const [selectedReview, setSelectedReview] = useState<{
    uri: string;
    value: MusicReview;
  } | null>(null);

  if (loading) {
    return (
      <div className="text-center py-6 text-zinc-200">
        Loading other reviews...
      </div>
    );
  }

  // error handling if user hasn't used ATtune
  if (reviews.length === 0) {
    return (
      <div className="text-center py-6 text-zinc-200">
        No other reviews found.
      </div>
    );
  }

  // content called to allow user to view review in read only mode
  // clicking reviews allows user to open comment modal for review
  return (
    <>
      <div className="space-y-4">
        {reviews.map((item) => (
          <ReviewItem
            key={item.uri}
            item={item}
            onDelete={() => {}}
            onEdit={async () => {}}
            onClick={() => setSelectedReview(item)}
            isReadOnly={true}
          />
        ))}
      </div>

      {selectedReview && (
        <CommentModal
          item={selectedReview}
          onClose={() => setSelectedReview(null)}
          onDelete={() => {}}
          onEdit={async () => {}}
          isReadOnly={true}
        />
      )}
    </>
  );
}
