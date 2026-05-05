// useReviewForm Hook
// Contains the following:
// - Hook to utilise review form
// - Handles review submission
// - Handles album search and selection

import { useState } from "react";
import { atApiService } from "../../lib/atproto";
import { LastFMAlbum } from "../../lib/lastfm";
import { getArtistName, getImageUrl } from "@/lib/utils";
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
  // constants storing information provided throught review form
  const [title, setTitle] = useState(initialTitle ?? "");
  const [artist, setArtist] = useState(initialArtist ?? "");
  const [albumImage, setAlbumImage] = useState(initialImage ?? "");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [listenedAt, setListenedAt] = useState(todayISO);
  const [publishToBluesky, setPublishToBluesky] = useState(true);
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

  // resets review form data
  const resetReviewFields = () => {
    setRating(0);
    setText("");
    setListenedAt(todayISO());
    setPublishToBluesky(true);
    setError("");
  };

  // handles selection from Last.fm albums provided from search
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

  // allows for user to change album reviewed through form
  const handleBackToSearch = () => {
    if (initialTitle) return;
    setIsSearchStep(true);
    setTitle("");
    setArtist("");
    setAlbumImage("");
    resetReviewFields();
  };

  // handles submission of review using .createReview() in user record
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await atApiService.createReview(
        {
          subjectTitle: title,
          subjectArtist: artist,
          rating: Number(rating),
          text,
          listenedAt: new Date(listenedAt).toISOString(),
        },
        publishToBluesky,
      );
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
    publishToBluesky,
    setPublishToBluesky,
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
