// ReviewList Component
// Contains the following:
// - Review list function to display reviews
// - Calls ReviewItem and StarRating components

"use client";

import { useReviews, UseReviewsProps } from "@/app/hooks/useReviews";
import ReviewItem from "./ReviewItem";
import { CommentModal } from "./CommentModal";
import { useReviewInteractions } from "@/app/hooks/useReviewInteractions";

export default function ReviewList(props: UseReviewsProps) {
  // constants used to handle reviews state
  // calls useReviewInteractions to handle review interactions
  const { reviews, loading, refresh } = useReviews(props);
  const { selectedReview, setSelectedReview, handleDelete, handleEdit } =
    useReviewInteractions(reviews, refresh);

  if (loading) {
    return (
      <div className="text-center py-10 text-zinc-200">Loading reviews...</div>
    );
  }

  // error handling if no reviews are found
  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 text-zinc-200">
        No reviews yet. Be the first!
      </div>
    );
  }

  // content is called to allow for editing of reviews
  // each review is displayed using ReviewItem component
  // CommentModal is displayed when user clicks on a review to view comments
  return (
    <>
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wider mb-3">
          Edit, delete a review or click on a review to view comments
        </h3>
        {reviews.map((item) => (
          <ReviewItem
            key={item.uri}
            item={item}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onClick={() => setSelectedReview(item)}
          />
        ))}
      </div>

      {selectedReview && (
        <CommentModal
          item={selectedReview}
          onClose={() => setSelectedReview(null)}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
    </>
  );
}
