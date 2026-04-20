// ReviewForm Component
// Contains the following:
// - Parent component to deal with review form
// - Calls useReviewForm hook to handle review creation
// - Calls AlbumSearch component to search for albums
// - Calls ReviewFormFields component to display review form fields

"use client";

import { useReviewForm } from "@/app/hooks/useReviewForm";
import { AlbumSearch } from "../record/AlbumSearch";
import { ReviewFormFields } from "./ReviewFormFields";

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
  const form = useReviewForm({
    initialTitle,
    initialArtist,
    initialImage,
    onReviewCreated,
  });

  return (
    <div className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 p-6 mb-8">
      <h3 className="text-xl font-bold mb-4 text-zinc-100">
        Add a Review
      </h3>

      {form.error && (
        <div className="mb-4 p-3 text-sm text-red-500 bg-red-900/20 rounded-md border border-red-800">
          {form.error}
        </div>
      )}

      {form.isSearchStep ? (
        <AlbumSearch
          searchQuery={form.searchQuery}
          onSearchChange={form.setSearchQuery}
          searchResults={form.searchResults}
          isSearching={form.isSearching}
          onSelectAlbum={form.handleSelectAlbum}
        />
      ) : (
        <form onSubmit={form.handleSubmit} className="space-y-6">
          <ReviewFormFields
            title={form.title}
            artist={form.artist}
            albumImage={form.albumImage}
            rating={form.rating}
            onRatingChange={form.setRating}
            text={form.text}
            onTextChange={form.setText}
            listenedAt={form.listenedAt}
            onListenedAtChange={form.setListenedAt}
            publishToBluesky={form.publishToBluesky}
            onPublishToBlueskyChange={form.setPublishToBluesky}
            loading={form.loading}
            initialTitle={initialTitle}
            onCancel={onCancel}
            onBackToSearch={form.handleBackToSearch}
          />
        </form>
      )}
    </div>
  );
}
