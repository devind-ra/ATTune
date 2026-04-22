// Other User's Profile Page
// Contains the following:
// - Displays useOtherProfilePage hook to get user data
// - Calls ProfileCard component to display general profile information
// - Calls TastesPanel component to display user's tastes
// - Calls ReviewActivity component to display user's review activity

"use client";

import { use } from "react";
import Navbar from "@/components/navbar/Navbar";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { TastesPanel } from "@/components/profile/TastesPanel";
import { RecentReviews } from "@/components/profile/RecentReviews";
import { ReviewActivity } from "@/components/profile/ReviewActivity";
import { useOtherProfilePage } from "@/app/hooks/useOtherProfilePage";

// eslint-disable-next-line max-lines-per-function
export default function OtherProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const resolvedParams = use(params);
  const handle = decodeURIComponent(resolvedParams.handle);

  const {
    session,
    authLoading,
    isLoadingProfile,
    profile,
    thisYearReviewCount,
    recentReviews,
    allReviews,
    refreshReviews,
    tastes,
    toggleFollow,
    isFollowingLoading,
  } = useOtherProfilePage(handle);

  if (authLoading || isLoadingProfile || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen font-sans selection:bg-sky-500/30">
        <main className="max-w-4xl mx-auto px-6 py-12">
          <Navbar />
          <div className="text-center mt-20">
            <h1 className="text-2xl font-bold text-zinc-100">
              Profile Not Found
            </h1>
            <p className="text-zinc-400 mt-2">
              The user @{handle} could not be found.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const isSelf = profile.handle === session.handle;

  return (
    <div className="min-h-screen font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />
        <ProfileCard
          profile={profile}
          thisYearReviewCount={thisYearReviewCount}
          isOtherUser={!isSelf}
          isFollowingLoading={isFollowingLoading}
          onFollowToggle={toggleFollow}
        />
        <TastesPanel
          isReadonly={true}
          tastes={tastes}
          isEditingTastes={false}
          setIsEditingTastes={() => { }}
          editArtists={[]}
          editGenres={[]}
          onArtistChange={() => { }}
          onGenreChange={() => { }}
          artistExcludeValues={[]}
          genreExcludeValues={[]}
          isSaving={false}
          onSave={() => { }}
          onCancel={() => { }}
        />
        <ReviewActivity allReviews={allReviews} />
        <RecentReviews reviews={recentReviews} refresh={refreshReviews} isReadOnly={!isSelf} />
      </main>
    </div>
  );
}
