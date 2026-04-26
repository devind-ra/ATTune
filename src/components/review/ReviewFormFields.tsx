// ReviewFormFields Component
// Contains the following:
// - Called by ReviewForm component to display review form fields
// - Displays album preview, star rating, review text area, date listened and publish to BlueSky checkbox
// - Calls ReviewFormActions component to display cancel and post review buttons

import StarRating from "./StarRating";
import { AlbumPreview } from "../record/AlbumPreview";
import { ReviewFormActions } from "../record/ReviewFormActions";

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
  publishToBluesky: boolean;
  onPublishToBlueskyChange: (v: boolean) => void;
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
  publishToBluesky,
  onPublishToBlueskyChange,
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

      <fieldset className="border-none p-0 m-0">
        <legend className="block text-sm font-medium mb-1 text-zinc-300">
          Rating ({rating / 2}/5)
        </legend>
        <StarRating rating={rating} onChange={onRatingChange} />
      </fieldset>

      <div>
        <label
          htmlFor="review-text-input"
          className="block text-sm font-medium mb-1 text-zinc-300"
        >
          Review
        </label>
        <textarea
          id="review-text-input"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all resize-none"
          placeholder="What did you think?"
        />
      </div>

      <div>
        <label
          htmlFor="date-listened-input"
          className="block text-sm font-medium mb-1 text-zinc-300"
        >
          Date Listened
        </label>
        <input
          id="date-listened-input"
          type="date"
          value={listenedAt}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => onListenedAtChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all cursor-pointer"
        />
      </div>

      <div>
        <label className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-800/50 cursor-pointer hover:bg-zinc-800 transition-colors">
          <div className="flex items-center h-5 mt-0.5">
            <input
              type="checkbox"
              checked={publishToBluesky}
              onChange={(e) => onPublishToBlueskyChange(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 text-sky-500 focus:ring-sky-500 bg-zinc-900"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-100">
              Publish to Bluesky Timeline
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              If unchecked, this review will only be saved to your ATtune
              profile. Comments will be disabled.
            </p>
          </div>
        </label>
      </div>

      <ReviewFormActions
        loading={loading}
        showCancel={!initialTitle || !!onCancel}
        onCancel={onCancel ?? onBackToSearch}
      />
    </>
  );
}
