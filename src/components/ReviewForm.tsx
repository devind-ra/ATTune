// ReviewForm Component
// Contains the following:
// - Review form function to handle review creation
// - Utilises Last.fm API to search for albums
// - Utilises AT Protocol to create reviews

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { atApiService } from "../lib/atproto";
import { searchAlbum, LastFMAlbum, LastFMImage } from "../lib/lastfm";
import { getArtistName } from "~/lib/utils";

interface ReviewFormProps {
  onReviewCreated: () => void;
  onCancel?: () => void;
  initialTitle?: string;
  initialArtist?: string;
  initialImage?: string;
}

export default function ReviewForm({
  onReviewCreated,
  onCancel,
  initialTitle,
  initialArtist,
  initialImage,
}: ReviewFormProps) {
  const [title, setTitle] = useState(initialTitle || "");
  const [artist, setArtist] = useState(initialArtist || "");
  const [albumImage, setAlbumImage] = useState(initialImage || "");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState("");
  const [listenedAt, setListenedAt] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isSearchStep, setIsSearchStep] = useState(!initialTitle);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LastFMAlbum[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        try {
          const results = await searchAlbum(searchQuery);
          setSearchResults(Array.isArray(results) ? results.slice(0, 5) : []);
        } catch (err) {
          console.error("Search failed:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getImageUrl = (
    imageArray: LastFMImage[] | undefined,
    preferredSize: string = "medium",
  ): string => {
    if (!imageArray || !Array.isArray(imageArray)) return "";
    const img =
      imageArray.find((i) => i.size === preferredSize) ?? imageArray[0];
    return img?.["#text"] ?? "";
  };

  const handleSelectAlbum = (album: LastFMAlbum) => {
    setTitle(album.name);
    setArtist(getArtistName(album.artist));
    setAlbumImage(
      getImageUrl(album.image, "extralarge") ||
        getImageUrl(album.image, "large"),
    );
    setIsSearchStep(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleBackToSearch = () => {
    if (initialTitle) return;
    setIsSearchStep(true);
    setTitle("");
    setArtist("");
    setAlbumImage("");
    setRating(5);
    setText("");
    setListenedAt(new Date().toISOString().split("T")[0]);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await atApiService.createReview({
        subjectTitle: title,
        subjectArtist: artist,
        rating: Number(rating),
        text: text,
        listenedAt: new Date(listenedAt).toISOString(),
      });

      if (!initialTitle) {
        handleBackToSearch();
      } else {
        setRating(5);
        setText("");
        setListenedAt(new Date().toISOString().split("T")[0]);
      }

      onReviewCreated();
    } catch (err: unknown) {
      console.error("Failed to create review", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create review");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
      <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
        Add a Review
      </h3>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {isSearchStep ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
              Search Album
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type an album name..."
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="min-h-[200px]">
            {isSearching ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {searchResults.map((album, idx) => {
                  const imgUrl = getImageUrl(album.image, "large");
                  return (
                    <li
                      key={idx}
                      onClick={() => handleSelectAlbum(album)}
                      className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-sky-500 dark:hover:border-sky-500 hover:shadow-md transition-all group"
                    >
                      <div className="shrink-0">
                        {imgUrl ? (
                          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                            <Image
                              src={imgUrl}
                              alt={album.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-zinc-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7.5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {album.name}
                        </span>
                        <span className="text-xs text-zinc-500 truncate">
                          {getArtistName(album.artist)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : searchQuery.trim().length > 2 ? (
              <div className="text-center py-8 text-zinc-500 text-sm">
                No albums found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 text-sm">
                Start typing to search for an album to review
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="shrink-0">
              {albumImage ? (
                <div className="relative w-20 h-20 rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-700 shadow-sm">
                  <Image
                    src={albumImage}
                    alt={title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-md bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shadow-sm">
                  <svg
                    className="w-8 h-8 text-zinc-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7.5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex flex-col flex-1 min-w-0 pt-1">
              <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 truncate">
                {title}
              </h4>
              <p className="text-zinc-500 text-sm truncate mb-2">{artist}</p>
              {!initialTitle && (
                <button
                  type="button"
                  onClick={handleBackToSearch}
                  className="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 w-fit cursor-pointer"
                >
                  Change Album
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
              Rating ({rating}/5)
            </label>
            <div
              className="flex gap-1"
              onMouseLeave={() => setHoveredRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  className={`p-1 transition-transform hover:scale-110 focus:outline-none focus:scale-110 ${
                    star <= (hoveredRating || rating)
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
              Review
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all resize-none"
              placeholder="What did you think?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
              Date Listened
            </label>
            <input
              type="date"
              value={listenedAt}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setListenedAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {(!initialTitle || onCancel) && (
              <button
                type="button"
                onClick={onCancel || handleBackToSearch}
                className="px-4 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-1 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {loading ? "Posting..." : "Post Review"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
