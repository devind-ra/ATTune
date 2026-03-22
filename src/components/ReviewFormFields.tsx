// ReviewFormFields Component
// Contains the following:
// - Called by ReviewForm component to display review form fields
// - Displays artist name, album name and album image
// - Displays review text area and star rating
// - Displays buttons for cancelling or submitting review

import Image from "next/image";
import StarRating from "./StarRating";

interface ReviewFormFieldsProps {
  title: string;
  artist: string;
  albumImage: string;
  rating: number;
  onRatingChange: (r: number) => void;
  text: string;
  onTextChange: (t: string) => void;
  listenedAt: string;
  onListenedAtChange: (d: string) => void;
  loading: boolean;
  initialTitle?: string;
  onCancel?: () => void;
  onBackToSearch: () => void;
}

export function ReviewFormFields({
  title,
  artist,
  albumImage,
  rating,
  onRatingChange,
  text,
  onTextChange,
  listenedAt,
  onListenedAtChange,
  loading,
  initialTitle,
  onCancel,
  onBackToSearch,
}: ReviewFormFieldsProps) {
  const cancelHandler = onCancel ?? onBackToSearch;
  const showCancel = !initialTitle || !!onCancel;

  return (
    <>
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
              onClick={onBackToSearch}
              className="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 w-fit cursor-pointer"
            >
              Change Album
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
          Rating ({rating / 2}/5)
        </label>
        <StarRating rating={rating} onChange={onRatingChange} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
          Review
        </label>
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
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
          onChange={(e) => onListenedAtChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all cursor-pointer"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {showCancel && (
          <button
            type="button"
            onClick={cancelHandler}
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {loading ? "Posting..." : "Post Review"}
        </button>
      </div>
    </>
  );
}
