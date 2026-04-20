// Reviews Page
// Contains the following:
// - Calls ReviewList component to display reviews

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ReviewList from "@/components/review/ReviewList";
import Navbar from "@/components/navbar/Navbar";
import { SortOption } from "@/app/hooks/useReviews";

// eslint-disable-next-line max-lines-per-function
export default function ReviewsPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [refreshTrigger] = useState(0);
  const [filterSortBy, setFilterSortBy] = useState<SortOption>("date-desc");

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/");
    }
  }, [session, isLoading, router]);

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />

        <a
          href="/profile"
          className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors"
        >
          Back to Profile
        </a>
        <br />
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold mb-0 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Your Reviews
              <span className="text-xs font-normal px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500">
                {session.handle}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-select"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Sort by:
              </label>
              <select
                id="sort-select"
                value={filterSortBy}
                onChange={(e) => setFilterSortBy(e.target.value as SortOption)}
                className="bg-zinc-100 dark:bg-zinc-800 py-1.5 px-3 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block focus:outline-none"
              >
                <option value="date-desc">Latest Listened</option>
                <option value="date-asc">Earliest Listened</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="rating-asc">Lowest Rated</option>
              </select>
            </div>
          </div>
          <ReviewList
            did={session.did}
            refreshTrigger={refreshTrigger}
            sortBy={filterSortBy}
          />
        </div>
      </main>
    </div>
  );
}
