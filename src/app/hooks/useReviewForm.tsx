// useReviewForm Hook
// Contains the following:
// - Hook to utilise review form
// - Handles review submission
// - Handles album search and selection

import { useState } from "react";
import { atApiService } from "../../lib/atproto";
import { LastFMAlbum } from "../../lib/lastfm";
import { getArtistName, getImageUrl } from "~/lib/utils";
import { useAlbumSearch } from "./useAlbumSearch";

interface UseReviewFormProps {
  initialTitle?: string;
  initialArtist?: string;
  initialImage?: string;
  onReviewCreated: () => void;
}

const todayISO = () => new Date().toISOString().split("T")[0];

// eslint-disable-next-line max-lines-per-function
export function useReviewForm({
  initialTitle,
  initialArtist,
  initialImage,
  onReviewCreated,
}: UseReviewFormProps) {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [artist, setArtist] = useState(initialArtist ?? "");
  const [albumImage, setAlbumImage] = useState(initialImage ?? "");
  const [rating, setRating] = useState(10);
  const [text, setText] = useState("");
  const [listenedAt, setListenedAt] = useState(todayISO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSearchStep, setIsSearchStep] = useState(!initialTitle);
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    clearSearch,
  } = useAlbumSearch();

  const resetReviewFields = () => {
    setRating(10);
    setText("");
    setListenedAt(todayISO());
    setError("");
  };

  const handleSelectAlbum = (album: LastFMAlbum) => {
    setTitle(album.name);
    setArtist(getArtistName(album.artist));
    setAlbumImage(
      getImageUrl(album.image, "extralarge") ||
      getImageUrl(album.image, "large"),
    );
    setIsSearchStep(false);
    clearSearch();
  };

  const handleBackToSearch = () => {
    if (initialTitle) return;
    setIsSearchStep(true);
    setTitle("");
    setArtist("");
    setAlbumImage("");
    resetReviewFields();
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
        text,
        listenedAt: new Date(listenedAt).toISOString(),
      });
      if (initialTitle) {
        resetReviewFields();
      } else {
        handleBackToSearch();
      }
      onReviewCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create review");
    } finally {
      setLoading(false);
    }
  };

  return {
    title,
    artist,
    albumImage,
    rating,
    setRating,
    text,
    setText,
    listenedAt,
    setListenedAt,
    loading,
    error,
    isSearchStep,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    handleSelectAlbum,
    handleBackToSearch,
    handleSubmit,
  };
}
