// useProfileTastes hook
// Contains the following:
// - Fetches user tastes
// - Handles editing user tastes
// - Validates user tastes

import { useState, useEffect, useMemo } from "react";
import { atApiService, UserTastes } from "@/lib/atproto";

const ARTIST_COUNT = 5;
const GENRE_COUNT = 3;

function padArray(arr: string[], length: number): string[] {
  const padded = [...arr];
  while (padded.length < length) padded.push("");
  return padded;
}

function hasDuplicates(arr: string[]): boolean {
  return new Set(arr).size !== arr.length;
}

export function useProfileTastes(did: string | undefined) {
  const [tastes, setTastes] = useState<UserTastes | null>(null);
  const [isEditingTastes, setIsEditingTastes] = useState(false);
  const [editArtists, setEditArtists] = useState<string[]>(
    Array(ARTIST_COUNT).fill(""),
  );
  const [editGenres, setEditGenres] = useState<string[]>(
    Array(GENRE_COUNT).fill(""),
  );
  const [isSavingTastes, setIsSavingTastes] = useState(false);

  useEffect(() => {
    if (!did) return;
    atApiService
      .getTastes(did)
      .then((userTastes) => {
        if (!userTastes) return;
        setTastes(userTastes);
        setEditArtists(padArray(userTastes.topArtists, ARTIST_COUNT));
        setEditGenres(padArray(userTastes.topGenres, GENRE_COUNT));
      })
      .catch((err) => console.error("Error fetching tastes:", err));
  }, [did]);

  const artistExcludeValues = useMemo(
    () => editArtists.map((_, i) => editArtists.filter((__, j) => j !== i)),
    [editArtists],
  );

  const genreExcludeValues = useMemo(
    () => editGenres.map((_, i) => editGenres.filter((__, j) => j !== i)),
    [editGenres],
  );

  const handleArtistChange = (idx: number, val: string) =>
    setEditArtists((prev) => prev.map((a, i) => (i === idx ? val : a)));

  const handleGenreChange = (idx: number, val: string) =>
    setEditGenres((prev) => prev.map((g, i) => (i === idx ? val : g)));

  const cancelEditTastes = () => {
    setIsEditingTastes(false);
    if (tastes) {
      setEditArtists(padArray(tastes.topArtists, ARTIST_COUNT));
      setEditGenres(padArray(tastes.topGenres, GENRE_COUNT));
    }
  };

  const handleSaveTastes = async () => {
    if (!did) return;
    const cleanArtists = editArtists
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean);
    const cleanGenres = editGenres
      .map((g) => g.trim().toLowerCase())
      .filter(Boolean);

    if (hasDuplicates(cleanArtists)) {
      alert("You can't enter the same artist more than once");
      return;
    }
    if (hasDuplicates(cleanGenres)) {
      alert("You can't enter the same genre more than once");
      return;
    }

    setIsSavingTastes(true);
    try {
      await atApiService.updateTastes({
        topArtists: editArtists.map((a) => a.trim()).filter(Boolean),
        topGenres: editGenres.map((g) => g.trim()).filter(Boolean),
      });
      setTastes(await atApiService.getTastes(did));
      setIsEditingTastes(false);
    } catch (err) {
      console.error("Failed to save tastes", err);
      alert("Failed to save tastes");
    } finally {
      setIsSavingTastes(false);
    }
  };

  return {
    tastes,
    isEditingTastes,
    setIsEditingTastes,
    editArtists,
    editGenres,
    handleArtistChange,
    handleGenreChange,
    artistExcludeValues,
    genreExcludeValues,
    isSavingTastes,
    handleSaveTastes,
    cancelEditTastes,
  };
}
