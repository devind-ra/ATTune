// Search Page
// Contains the following:
// - Page for linking input from Navbar to search results
// - Displays search results from Last.fm API data
// - Calls useSearch hook to get search results
// - Calls SearchResultSections component to display search results

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import { useSearch } from "@/app/hooks/useSearch";
import { SearchResultSections } from "@/components/SearchResultSections";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const {
    artists,
    albums,
    primaryResultType,
    isSearching,
    session,
    authLoading,
  } = useSearch(query);

  if (authLoading || !session) return null;

  return (
    <div className="min-h-screen font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar initialSearchQuery={query || ""} />

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-100">
            {query ? `Search results for "${query}"` : "Enter a search term"}
          </h2>
        </div>

        {isSearching ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
          </div>
        ) : (
          query && (
            <SearchResultSections
              artists={artists}
              albums={albums}
              primaryResultType={primaryResultType}
            />
          )
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
