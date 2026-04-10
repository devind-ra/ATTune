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

interface OtherReviewsListProps {
  title: string;
  artist: string;
  currentUserDid: string;
  refreshTrigger?: number;
}

export default function OtherReviewsList(props: OtherReviewsListProps) {
  const { reviews, loading } = useOtherReviews(props);
  const [selectedReview, setSelectedReview] = useState<{
    uri: string;
    value: MusicReview;
  } | null>(null);

  if (loading) {
    return (
      <div className="text-center py-6 text-zinc-500">
        Loading other reviews...
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

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
