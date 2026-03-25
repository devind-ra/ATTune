// RecentReviews Component
// Contains the following:
// - Displays user's recent reviews
// - Calls to MusicReview for displaying recent reviews
// - Calls to Link for linking to artist/album pages

import Link from "next/link";
import { MusicReview } from "@/lib/atproto";

interface RecentReviewsProps {
  reviews: { uri: string; value: MusicReview }[];
}

// eslint-disable-next-line max-lines-per-function
export function RecentReviews({ reviews }: RecentReviewsProps) {
  if (reviews.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Recent Reviews
      </h2>
      <div className="space-y-4">
        {reviews.map((item) => (
          <div
            key={item.uri}
            className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <Link
                  href={`/album/${encodeURIComponent(item.value.subjectArtist)}/${encodeURIComponent(item.value.subjectTitle)}`}
                  className="hover:underline decoration-zinc-400 dark:decoration-zinc-500"
                >
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {item.value.subjectTitle}
                  </h4>
                </Link>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  by{" "}
                  <Link
                    href={`/artist/${encodeURIComponent(item.value.subjectArtist)}`}
                    className="hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 px-1 -mx-1 rounded transition-colors"
                  >
                    {item.value.subjectArtist}
                  </Link>
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">★</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {item.value.rating / 2}
                </span>
              </div>
            </div>
            {item.value.text && (
              <p className="text-zinc-700 dark:text-zinc-300 mt-2 text-sm leading-relaxed line-clamp-3">
                {item.value.text}
              </p>
            )}
            <div className="mt-4 text-xs text-zinc-400">
              Listened on{" "}
              {new Date(
                item.value.listenedAt || item.value.createdAt,
              ).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link
          href="#"
          className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors"
        >
          Show more reviews →
        </Link>
      </div>
    </div>
  );
}
