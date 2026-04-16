// useReviewInteractions hook
// Contains the following:
// - Handles review interactions (edit and deletion)
// - Calls to atApiService for updating and deleting reviews

import { useState } from "react";
import { atApiService, MusicReview } from "@/lib/atproto";

export function useReviewInteractions(
  reviews: { uri: string; value: MusicReview }[],
  refresh: () => void,
) {
  const [selectedReview, setSelectedReview] = useState<{
    uri: string;
    value: MusicReview;
  } | null>(null);

  const handleDelete = async (uri: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await atApiService.deleteReview(uri);
        refresh();
        if (selectedReview?.uri === uri) {
          setSelectedReview(null);
        }
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

      if (selectedReview?.uri === uri) {
        setSelectedReview({
          ...originalItem,
          value: {
            ...originalItem.value,
            subjectTitle: editData.subjectTitle!,
            subjectArtist: editData.subjectArtist!,
            rating: Number(editData.rating!),
            text: editData.text,
            listenedAt: editData.listenedAt!,
          }
        });
      }
    } catch (err) {
      console.log("Failed to update review", err);
      alert("Failed to update review. Make sure you are logged in.");
    }
  };

  return { selectedReview, setSelectedReview, handleDelete, handleEdit };
}
