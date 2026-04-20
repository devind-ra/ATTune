// RecentReviews Component
// Contains the following:
// - Displays user's recent reviews
// - Calls to MusicReview for displaying recent reviews
// - Calls to Link for linking to artist/album pages

import Link from "next/link";
import { MusicReview } from "@/lib/atproto";
import ReviewItem from "../review/ReviewItem";
import { CommentModal } from "../review/CommentModal";
import { useReviewInteractions } from "@/app/hooks/useReviewInteractions";

interface RecentReviewsProps {
  reviews: { uri: string; value: MusicReview }[];
  refresh: () => void;
}

export function RecentReviews({ reviews, refresh }: RecentReviewsProps) {
  const { selectedReview, setSelectedReview, handleDelete, handleEdit } =
    useReviewInteractions(reviews, refresh);

  if (reviews.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-zinc-100 mb-6">Recent Reviews</h2>
      <h3 className="text-sm font-bold text-white tracking-wider mb-3">
        Edit, delete a review or click on a review to view comments
      </h3>
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

      <div className="mt-6 text-center">
        <Link
          href="/reviews"
          className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
        >
          Show more reviews →
        </Link>
      </div>
    </div>
  );
}
