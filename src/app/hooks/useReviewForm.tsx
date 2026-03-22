// useReviewForm Hook
// Contains the following:
// - Hook to utilise review form
// - Handles review submission
// - Handles album search and selection

import { useState, useEffect } from "react";
import { atApiService } from "../../lib/atproto";
import { searchAlbum, LastFMAlbum } from "../../lib/lastfm";
import { getArtistName, getImageUrl } from "~/lib/utils";

interface UseReviewFormProps {
  initialTitle?: string;
  initialArtist?: string;
  initialImage?: string;
  onReviewCreated: () => void;
}

export function useReviewForm({
  initialTitle,
  initialArtist,
  initialImage,
  onReviewCreated,
}: UseReviewFormProps) {
  const [title, setTitle] = useState(initialTitle || "");
  const [artist, setArtist] = useState(initialArtist || "");
  const [albumImage, setAlbumImage] = useState(initialImage || "");
  const [rating, setRating] = useState(10);
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

  const resetReviewFields = () => {
    setRating(10);
    setText("");
    setListenedAt(new Date().toISOString().split("T")[0]);
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
    setSearchQuery("");
    setSearchResults([]);
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
      console.error("Failed to create review", err);
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
    getImageUrl,
  };
}
