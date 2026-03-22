// Profile Page
// Contains the following:
// - Profile page displays user profile information linked to Bluesky
// - Calls to TasteEditor for editing tastes
// - Calls to TastesViewer for viewing tastes
// - Calls to RecentReviews for displaying recent reviews

"use client";

import Image from "next/image";
import Navbar from "../../components/Navbar";
import { TastesEditor } from "../../components/TastesEditor";
import { TastesViewer } from "../../components/TastesViewer";
import { RecentReviews } from "../../components/RecentReviews";
import { useProfilePage } from "../../app/hooks/useProfilePage";

export default function ProfilePage() {
  const {
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
  } = useProfilePage();

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );
  }

  const handleArtistChange = (idx: number, val: string) => {
    const updated = [...editArtists];
    updated[idx] = val;
    setEditArtists(updated);
  };

  const handleGenreChange = (idx: number, val: string) => {
    const updated = [...editGenres];
    updated[idx] = val;
    setEditGenres(updated);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />

        {profile && (
          <div className="mt-8 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-6">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt="Avatar"
                  width={80}
                  height={80}
                  className="w-24 h-24 rounded-full object-cover border-2 border-zinc-100 dark:border-zinc-800"
                  unoptimized
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-400">
                  {profile.displayName?.charAt(0) || profile.handle.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  {profile.displayName || profile.handle}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                  @{profile.handle}
                </p>
                <div className="flex gap-4 text-sm mt-4">
                  <div className="bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 px-3 py-1 rounded-full font-medium">
                    {thisYearReviewCount}{" "}
                    {thisYearReviewCount === 1 ? "Review" : "Reviews"} this year
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-3 py-1 rounded-full font-medium">
                    {profile.followersCount || 0} Followers
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-3 py-1 rounded-full font-medium">
                    {profile.followsCount || 0} Following
                  </div>
                </div>
              </div>
            </div>
            {profile.description && (
              <p className="mt-6 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                {profile.description}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Music Tastes
            </h2>
            {!isEditingTastes && (
              <button
                onClick={() => setIsEditingTastes(true)}
                className="text-sm px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Edit Tastes
              </button>
            )}
          </div>

          {isEditingTastes ? (
            <TastesEditor
              editArtists={editArtists}
              editGenres={editGenres}
              onArtistChange={handleArtistChange}
              onGenreChange={handleGenreChange}
              artistExcludeValues={artistExcludeValues}
              genreExcludeValues={genreExcludeValues}
              isSaving={isSavingTastes}
              onSave={handleSaveTastes}
              onCancel={cancelEditTastes}
            />
          ) : (
            <TastesViewer tastes={tastes} />
          )}
        </div>

        <RecentReviews reviews={recentReviews} />
      </main>
    </div>
  );
}
