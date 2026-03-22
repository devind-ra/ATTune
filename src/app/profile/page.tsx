// Profile Page
// Contains the following:
// - Profile page displays user profile information linked to Bluesky
// - Displays user's music tastes and recent reviews
// - Allows users to edit their music tastes (favourite artists and tags)
// - Utilises AT Protocol to retrieve and display data
// - Utilises Last.fm API to retrieve data

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/Navbar";
import { atApiService, MusicReview, UserTastes } from "../../lib/atproto";
import { AppBskyActorDefs } from "@atproto/api";
import Link from "next/link";
import Image from "next/image";
import {
  searchArtist,
  getTopTags,
  LastFMTag,
  LastFMArtist,
} from "../../lib/lastfm";

function AutocompleteInput({
  value,
  onChange,
  placeholder,
  fetchSuggestions,
  excludeValues = [],
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  fetchSuggestions: (q: string) => Promise<string[]>;
  excludeValues?: string[];
}) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 2 && searchQuery !== value) {
        setIsSearching(true);
        setShowSuggestions(true);
        try {
          const results = await fetchSuggestions(searchQuery);
          const filtered = (Array.isArray(results) ? results : []).filter(
            (r) =>
              !excludeValues.some(
                (ex) => ex.trim().toLowerCase() === r.trim().toLowerCase(),
              ),
          );
          setSearchResults(filtered);
        } catch (err) {
          console.error("Search failed:", err);
        } finally {
          setIsSearching(false);
        }
      } else if (searchQuery.trim().length <= 2) {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions, value, excludeValues]);

  const handleSelect = (s: string) => {
    setSearchQuery(s);
    onChange(s);
    setSearchResults([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative flex-1">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => {
          if (searchResults.length > 0) setShowSuggestions(true);
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-sky-500 outline-none"
      />
      {showSuggestions && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-48 overflow-auto">
          {isSearching ? (
            <li className="p-3 flex justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600"></div>
            </li>
          ) : searchResults.length > 0 ? (
            searchResults.map((s, idx) => (
              <li
                key={idx}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(s);
                }}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer text-zinc-900 dark:text-zinc-100 text-sm"
              >
                {s}
              </li>
            ))
          ) : searchQuery.trim().length > 2 ? (
            <li className="p-2 text-zinc-500 text-sm">No results found</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
export default function ProfilePage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] =
    useState<AppBskyActorDefs.ProfileViewDetailed | null>(null);
  const [thisYearReviewCount, setThisYearReviewCount] = useState<number>(0);
  const [recentReviews, setRecentReviews] = useState<
    { uri: string; value: MusicReview }[]
  >([]);

  const [tastes, setTastes] = useState<UserTastes | null>(null);
  const [isEditingTastes, setIsEditingTastes] = useState(false);
  const [editArtists, setEditArtists] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
  ]);
  const [editGenres, setEditGenres] = useState<string[]>(["", "", ""]);
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
    if (!isLoading && !session) {
      router.push("/");
    }
  }, [session, isLoading, router]);

  useEffect(() => {
    async function fetchProfileData() {
      if (session) {
        try {
          const profileRes = await atApiService.agent.getProfile({
            actor: session.did,
          });
          setProfile(profileRes.data);

          const reviews = await atApiService.getReviews(session.did);

          const currentYear = new Date().getFullYear();
          const thisYearReviews = reviews.filter((r) => {
            const date = new Date(r.value.listenedAt || r.value.createdAt);
            return date.getFullYear() === currentYear;
          });
          setThisYearReviewCount(thisYearReviews.length);

          const sortedReviews = [...reviews].sort(
            (a, b) =>
              new Date(b.value.listenedAt || b.value.createdAt).getTime() -
              new Date(a.value.listenedAt || a.value.createdAt).getTime(),
          );
          setRecentReviews(sortedReviews.slice(0, 2));

          const userTastes = await atApiService.getTastes(session.did);
          if (userTastes) {
            setTastes(userTastes);

            const paddedArtists = [...userTastes.topArtists];
            while (paddedArtists.length < 5) paddedArtists.push("");
            setEditArtists(paddedArtists);

            const paddedGenres = [...userTastes.topGenres];
            while (paddedGenres.length < 3) paddedGenres.push("");
            setEditGenres(paddedGenres);
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      }
    }
    if (session) {
      fetchProfileData();
    }
  }, [session]);

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

      const finalArtists = editArtists.map((a) => a.trim()).filter(Boolean);
      const finalGenres = editGenres.map((g) => g.trim()).filter(Boolean);

      await atApiService.updateTastes({
        topArtists: finalArtists,
        topGenres: finalGenres,
      });

      const updated = await atApiService.getTastes(session.did);
      setTastes(updated);
      setIsEditingTastes(false);
    } catch (error) {
      console.error("Failed to save tastes", error);
      alert("Failed to save tastes");
    } finally {
      setIsSavingTastes(false);
    }
  };

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

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
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">
                  Top 5 Artists
                </h3>
                <div className="space-y-2">
                  {editArtists.map((artist, idx) => (
                    <div
                      key={`artist-${idx}`}
                      className="flex items-center gap-3"
                    >
                      <span className="w-6 text-center font-medium text-zinc-400">
                        {idx + 1}.
                      </span>
                      <AutocompleteInput
                        value={artist}
                        onChange={(val) => {
                          const newArr = [...editArtists];
                          newArr[idx] = val;
                          setEditArtists(newArr);
                        }}
                        placeholder="Artist Name"
                        excludeValues={artistExcludeValues[idx]}
                        fetchSuggestions={async (q) => {
                          const res = await searchArtist(q);
                          return res
                            .slice(0, 5)
                            .map((a: LastFMArtist) => a.name);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">
                  Top 3 Genres
                </h3>
                <div className="space-y-2">
                  {editGenres.map((genre, idx) => (
                    <div
                      key={`genre-${idx}`}
                      className="flex items-center gap-3"
                    >
                      <span className="w-6 text-center font-medium text-zinc-400">
                        {idx + 1}.
                      </span>
                      <AutocompleteInput
                        value={genre}
                        onChange={(val) => {
                          const newArr = [...editGenres];
                          newArr[idx] = val;
                          setEditGenres(newArr);
                        }}
                        placeholder="Genre Name"
                        excludeValues={genreExcludeValues[idx]}
                        fetchSuggestions={async (q) => {
                          const res = await getTopTags("200");
                          return res
                            .filter((t: LastFMTag) =>
                              t.name.toLowerCase().includes(q.toLowerCase()),
                            )
                            .slice(0, 5)
                            .map((t: LastFMTag) => t.name);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveTastes}
                  disabled={isSavingTastes}
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSavingTastes ? "Saving..." : "Save Tastes"}
                </button>
                <button
                  onClick={() => {
                    setIsEditingTastes(false);
                    if (tastes) {
                      const paddedArtists = [...tastes.topArtists];
                      while (paddedArtists.length < 5) paddedArtists.push("");
                      setEditArtists(paddedArtists);
                      const paddedGenres = [...tastes.topGenres];
                      while (paddedGenres.length < 3) paddedGenres.push("");
                      setEditGenres(paddedGenres);
                    }
                  }}
                  className="px-6 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">
                  Top Artists
                </h3>
                {tastes?.topArtists && tastes.topArtists.length > 0 ? (
                  <ul className="space-y-2">
                    {tastes.topArtists.map((artist, idx) => (
                      <li
                        key={`view-artist-${idx}`}
                        className="flex items-center gap-3 text-zinc-800 dark:text-zinc-200"
                      >
                        <span className="w-6 text-center font-medium text-sky-500">
                          {idx + 1}.
                        </span>
                        <Link
                          href={`/artist/${encodeURIComponent(artist)}`}
                          className="font-medium hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 px-2 py-1 -mx-2 rounded transition-colors"
                        >
                          {artist}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-400 italic">No artists added yet.</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">
                  Top Genres
                </h3>
                {tastes?.topGenres && tastes.topGenres.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tastes.topGenres.map((genre, idx) => (
                      <span
                        key={`view-genre-${idx}`}
                        className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-sm font-medium border border-zinc-200 dark:border-zinc-700"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 italic">No genres added yet.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {recentReviews.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Recent Reviews
              </h2>
            </div>
            <div className="space-y-4">
              {recentReviews.map((item) => (
                <div
                  key={item.uri}
                  className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {item.value.subjectTitle}
                      </h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        by{" "}
                        <Link
                          href={`/artist/${encodeURIComponent(item.value.subjectArtist)}`}
                          className="hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 px-1 -mx-1 rounded transition-colors"
                        >
                          {item.value.subjectArtist}
                        </Link>
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {item.value.rating / 2}
                      </span>
                    </div>
                  </div>
                  {item.value.text && (
                    <p className="text-zinc-700 dark:text-zinc-300 mt-2 text-sm leading-relaxed line-clamp-3">
                      {item.value.text}
                    </p>
                  )}
                  <div className="mt-4 text-xs text-zinc-400">
                    Listened on{" "}
                    {new Date(
                      item.value.listenedAt || item.value.createdAt,
                    ).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="#"
                className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors"
              >
                Show more reviews →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
