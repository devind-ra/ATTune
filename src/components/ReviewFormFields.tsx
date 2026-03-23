// ReviewFormFields Component
// Contains the following:
// - Called by ReviewForm component to display review form fields
// - Displays album preview, star rating, review text area and date listened
// - Calls ReviewFormActions component to display cancel and post review buttons

import StarRating from "./StarRating";
import { AlbumPreview } from "./record/AlbumPreview";
import { ReviewFormActions } from "./record/ReviewFormActions";

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

// eslint-disable-next-line max-lines-per-function
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
  return (
    <>
      <AlbumPreview
        title={title}
        artist={artist}
        albumImage={albumImage}
        showChangeAlbum={!initialTitle}
        onBackToSearch={onBackToSearch}
      />

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

      <ReviewFormActions
        loading={loading}
        showCancel={!initialTitle || !!onCancel}
        onCancel={onCancel ?? onBackToSearch}
      />
    </>
  );
}
