// ReviewList Component
// Contains the following:
// - Review list function to display reviews
// - Utilises AT Protocol to retrieve reviews
// - Handles CRUD actions for reviews

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { atApiService, MusicReview } from "../lib/atproto";

interface ReviewListProps {
  did: string;
  refreshTrigger: number;
  filterTitle?: string;
  filterArtist?: string;
}

export default function ReviewList({
  did,
  refreshTrigger,
  filterTitle,
  filterArtist,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<{ uri: string; value: MusicReview }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [editingUri, setEditingUri] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MusicReview>>({});
  const [hoveredRating, setHoveredRating] = useState(0);

  const fetchReviews = useCallback(async () => {
    try {
      const data = await atApiService.getReviews(did);

      let filteredData = data;
      if (filterTitle) {
        filteredData = filteredData.filter(
          (item) =>
            item.value.subjectTitle &&
            item.value.subjectTitle.toLowerCase() === filterTitle.toLowerCase(),
        );
      }
      if (filterArtist) {
        filteredData = filteredData.filter(
          (item) =>
            item.value.subjectArtist &&
            item.value.subjectArtist.toLowerCase() ===
              filterArtist.toLowerCase(),
        );
      }

      const sorted = filteredData.sort((a, b) => {
        const timeA = new Date(
          a.value.listenedAt || a.value.createdAt,
        ).getTime();
        const timeB = new Date(
          b.value.listenedAt || b.value.createdAt,
        ).getTime();
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });
      setReviews(sorted);
    } catch (err) {
      console.log("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  }, [did, filterTitle, filterArtist]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshTrigger]);

  const handleDelete = async (uri: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await atApiService.deleteReview(uri);
        fetchReviews();
      } catch (err) {
        console.log("Failed to delete review", err);
        alert("Failed to delete review. Make sure you are logged in.");
      }
    }
  };

  const handleEditClick = (item: { uri: string; value: MusicReview }) => {
    setEditingUri(item.uri);
    setEditForm({
      subjectTitle: item.value.subjectTitle,
      subjectArtist: item.value.subjectArtist,
      rating: item.value.rating,
      text: item.value.text || "",
      listenedAt: item.value.listenedAt,
    });
  };

  const submitEdit = async (item: { uri: string; value: MusicReview }) => {
    const { subjectTitle, subjectArtist, rating, text, listenedAt } = editForm;

    if (!subjectTitle || !subjectArtist || !rating || !listenedAt) return;

    try {
      await atApiService.updateReview(
        item.uri,
        {
          subjectTitle,
          subjectArtist,
          rating: Number(rating),
          text,
          listenedAt,
        },
        item.value.createdAt,
      );
      setEditingUri(null);
      fetchReviews();
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
    <div className="space-y-4">
      {reviews.map((item) => (
        <div
          key={item.uri}
          className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
        >
          {editingUri === item.uri ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                  Album Title
                </label>
                <input
                  type="text"
                  value={editForm.subjectTitle || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, subjectTitle: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 outline-none opacity-50 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                  Artist
                </label>
                <input
                  type="text"
                  value={editForm.subjectArtist || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, subjectArtist: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 outline-none opacity-50 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                  Rating ({editForm.rating || 1}/5)
                </label>
                <div
                  className="flex gap-1"
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, rating: star })}
                      onMouseEnter={() => setHoveredRating(star)}
                      className={`p-1 transition-transform hover:scale-110 focus:outline-none focus:scale-110 ${
                        star <= (hoveredRating || editForm.rating || 1)
                          ? "text-yellow-400 dark:text-yellow-500"
                          : "text-zinc-300 dark:text-zinc-600"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-8 h-8"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                  Date Listened
                </label>
                <input
                  type="date"
                  value={
                    editForm.listenedAt
                      ? new Date(editForm.listenedAt)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      listenedAt: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                  Review
                </label>
                <textarea
                  value={editForm.text || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, text: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] cursor-pointer"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => submitEdit(item)}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingUri(null)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
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
                  <Link
                    href={`/artist/${encodeURIComponent(item.value.subjectArtist)}`}
                    className="hover:underline decoration-zinc-400 dark:decoration-zinc-500 inline-block mt-0.5"
                  >
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      by {item.value.subjectArtist}
                    </p>
                  </Link>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {item.value.rating}
                    </span>
                  </div>
                  <div className="flex space-x-3 text-xs">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.uri)}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {item.value.text && (
                <p className="text-zinc-700 dark:text-zinc-300 mt-2 text-sm leading-relaxed">
                  {item.value.text}
                </p>
              )}

              <div className="mt-4 text-xs text-zinc-400">
                Listened on{" "}
                {new Date(
                  item.value.listenedAt || item.value.createdAt,
                ).toLocaleDateString()}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
