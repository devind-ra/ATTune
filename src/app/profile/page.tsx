// Profile Page
// Contains the following:
// - Profile page displays user profile information linked to Bluesky
// - Calls to TastesPanel for editing and viewing tastes
// - Displaying profile information using ProfileCard component
// - Displaying recent reviews using RecentReviews component

"use client";

import Navbar from "@/components/navbar/Navbar";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { TastesPanel } from "@/components/profile/TastesPanel";
import { RecentReviews } from "@/components/profile/RecentReviews";
import { ReviewActivity } from "@/components/profile/ReviewActivity";
import { useProfilePage } from "@/app/hooks/useProfilePage";

// eslint-disable-next-line max-lines-per-function
export default function ProfilePage() {
  // useProfilePage hook used to ensure all data needed for Profile page is retrieved
  const {
    session,
    isLoading,
    profile,
    thisYearReviewCount,
    recentReviews,
    allReviews,
    refreshReviews,
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
  } = useProfilePage();

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );
  }

  // content called to follow fixed structure of profile page content with modular components
  return (
    <div className="min-h-screen   font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />
        {profile && (
          <ProfileCard
            profile={profile}
            thisYearReviewCount={thisYearReviewCount}
          />
        )}
        <TastesPanel
          tastes={tastes}
          isEditingTastes={isEditingTastes}
          setIsEditingTastes={setIsEditingTastes}
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
        <ReviewActivity allReviews={allReviews} />
        <RecentReviews
          reviews={recentReviews}
          refresh={refreshReviews}
          handle={session.handle}
        />
      </main>
    </div>
  );
}
