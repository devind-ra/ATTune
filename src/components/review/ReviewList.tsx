// ReviewList Component
// Contains the following:
// - Review list function to display reviews
// - Utilises AT Protocol to retrieve reviews
// - Calls ReviewItem and StarRating components

"use client";

import { useReviews, UseReviewsProps } from "@/app/hooks/useReviews";
import ReviewItem from "./ReviewItem";
import { CommentModal } from "./CommentModal";
import { useState } from "react";
import { atApiService, MusicReview } from "@/lib/atproto";

// eslint-disable-next-line max-lines-per-function
export default function ReviewList(props: UseReviewsProps) {
  const { reviews, loading, refresh } = useReviews(props);
  const [selectedReview, setSelectedReview] = useState<{
    uri: string;
    value: MusicReview;
  } | null>(null);

  const handleDelete = async (uri: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await atApiService.deleteReview(uri);
        refresh();
      } catch (err) {
        console.log("Failed to delete review", err);
        alert("Failed to delete review. Make sure you are logged in.");
      }
    }
  };

  const handleEdit = async (uri: string, editData: Partial<MusicReview>) => {
    try {
      const originalItem = reviews.find((r) => r.uri === uri);
      if (!originalItem) return;

      await atApiService.updateReview(
        uri,
        {
          subjectTitle: editData.subjectTitle!,
          subjectArtist: editData.subjectArtist!,
          rating: Number(editData.rating!),
          text: editData.text,
          listenedAt: editData.listenedAt!,
        },
        originalItem.value.createdAt,
      );
      refresh();
    } catch (err) {
      console.log("Failed to update review", err);
      alert("Failed to update review. Make sure you are logged in.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-zinc-500">Loading reviews...</div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 text-zinc-500">
        No reviews yet. Be the first!
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
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
