// useProfilePage hook
// Contains the following:
// - Deals with profile page logic
// - Handles saving user tastes

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { atApiService, MusicReview, UserTastes } from "../../lib/atproto";
import { AppBskyActorDefs } from "@atproto/api";

const ARTIST_COUNT = 5;
const GENRE_COUNT = 3;

function padArray(arr: string[], length: number): string[] {
  const padded = [...arr];
  while (padded.length < length) padded.push("");
  return padded;
}

export function useProfilePage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] =
    useState<AppBskyActorDefs.ProfileViewDetailed | null>(null);
  const [thisYearReviewCount, setThisYearReviewCount] = useState(0);
  const [recentReviews, setRecentReviews] = useState<
    { uri: string; value: MusicReview }[]
  >([]);
  const [tastes, setTastes] = useState<UserTastes | null>(null);
  const [isEditingTastes, setIsEditingTastes] = useState(false);
  const [editArtists, setEditArtists] = useState<string[]>(
    Array(ARTIST_COUNT).fill(""),
  );
  const [editGenres, setEditGenres] = useState<string[]>(
    Array(GENRE_COUNT).fill(""),
  );
  const [isSavingTastes, setIsSavingTastes] = useState(false);

  const artistExcludeValues = useMemo(
    () => editArtists.map((_, i) => editArtists.filter((__, j) => j !== i)),
    [editArtists],
  );

  const genreExcludeValues = useMemo(
    () => editGenres.map((_, i) => editGenres.filter((__, j) => j !== i)),
    [editGenres],
  );

  useEffect(() => {
    if (!isLoading && !session) router.push("/");
  }, [session, isLoading, router]);

  useEffect(() => {
    if (!session) return;

    async function fetchProfileData() {
      try {
        const profileRes = await atApiService.agent.getProfile({
          actor: session!.did,
        });
        setProfile(profileRes.data);

        const reviews = await atApiService.getReviews(session!.did);
        const currentYear = new Date().getFullYear();

        setThisYearReviewCount(
          reviews.filter(
            (r) =>
              new Date(
                r.value.listenedAt || r.value.createdAt,
              ).getFullYear() === currentYear,
          ).length,
        );

        const sorted = [...reviews].sort(
          (a, b) =>
            new Date(b.value.listenedAt || b.value.createdAt).getTime() -
            new Date(a.value.listenedAt || a.value.createdAt).getTime(),
        );
        setRecentReviews(sorted.slice(0, 2));

        const userTastes = await atApiService.getTastes(session!.did);
        if (userTastes) {
          setTastes(userTastes);
          setEditArtists(padArray(userTastes.topArtists, ARTIST_COUNT));
          setEditGenres(padArray(userTastes.topGenres, GENRE_COUNT));
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    }

    fetchProfileData();
  }, [session]);

  const cancelEditTastes = () => {
    setIsEditingTastes(false);
    if (tastes) {
      setEditArtists(padArray(tastes.topArtists, ARTIST_COUNT));
      setEditGenres(padArray(tastes.topGenres, GENRE_COUNT));
    }
  };

  const handleSaveTastes = async () => {
    if (!session) return;
    setIsSavingTastes(true);
    try {
      const cleanArtists = editArtists
        .map((a) => a.trim().toLowerCase())
        .filter(Boolean);
      const cleanGenres = editGenres
        .map((g) => g.trim().toLowerCase())
        .filter(Boolean);

      if (new Set(cleanArtists).size !== cleanArtists.length) {
        alert("You can't enter the same artist more than once");
        return;
      }
      if (new Set(cleanGenres).size !== cleanGenres.length) {
        alert("You can't enter the same genre more than once");
        return;
      }

      await atApiService.updateTastes({
        topArtists: editArtists.map((a) => a.trim()).filter(Boolean),
        topGenres: editGenres.map((g) => g.trim()).filter(Boolean),
      });

      setTastes(await atApiService.getTastes(session.did));
      setIsEditingTastes(false);
    } catch (error) {
      console.error("Failed to save tastes", error);
      alert("Failed to save tastes");
    } finally {
      setIsSavingTastes(false);
    }
  };

  return {
    session,
    isLoading,
    profile,
    thisYearReviewCount,
    recentReviews,
    tastes,
    isEditingTastes,
    setIsEditingTastes,
    editArtists,
    setEditArtists,
    editGenres,
    setEditGenres,
    artistExcludeValues,
    genreExcludeValues,
    isSavingTastes,
    handleSaveTastes,
    cancelEditTastes,
  };
}
