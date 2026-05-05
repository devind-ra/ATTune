// Sections library
// Contains the following:
// - List of all sections which can be edited on the home page with toggles
// - Utilises state to ensure filter consistency is maintained

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

// extensible list of sections for home page
export const ALL_SECTIONS = [
  { id: "tagArtists", label: "Recommended Artists by Taste" },
  { id: "recommendedArtists", label: "Similar Artists by Taste" },
  { id: "recommendedAlbums", label: "Recommended Albums" },
  { id: "musicPublications", label: "Music Publications on Bluesky" },
] as const;

export type SectionId = (typeof ALL_SECTIONS)[number]["id"];

// extensible list of sections for explore page
export const EXPLORE_SECTIONS = [
  { id: "discoverAlbums", label: "Discover Albums" },
  { id: "topArtists", label: "Top Artists Globally" },
  { id: "trendingTracks", label: "Trending Tracks Globally" },
  { id: "geoTopArtists", label: "Top Artists By Country" },
] as const;

export type ExploreSectionId = (typeof EXPLORE_SECTIONS)[number]["id"];

// eslint-disable-next-line max-lines-per-function
export function useVisibleSections<T extends string>(
  sections: readonly { id: T; label: string }[],
  storageKeyPrefix: string,
) {
  // constants for sections for home and explore page
  const { session } = useAuth();

  const [visibleSections, setVisibleSections] = useState<Set<T>>(
    () => new Set(sections.map((s) => s.id)),
  );

  const [isInitialised, setIsInitialised] = useState(false);

  // retrieving user stored section preferences
  useEffect(() => {
    if (!session?.did) return;

    try {
      const stored = localStorage.getItem(
        `attune_${storageKeyPrefix}_${session.did}`,
      );
      if (stored) {
        const parsedIds = JSON.parse(stored) as string[];
        const validIds = parsedIds.filter((id) =>
          sections.some((s) => s.id === id),
        ) as T[];

        if (validIds.length > 0) {
          setVisibleSections(new Set(validIds));
        }
      }
    } catch (e) {
      console.error("Failed to parse stored section preferences:", e);
    }

    setIsInitialised(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.did, storageKeyPrefix]);

  useEffect(() => {
    if (!session?.did || !isInitialised) return;

    localStorage.setItem(
      `attune_${storageKeyPrefix}_${session.did}`,
      JSON.stringify(Array.from(visibleSections)),
    );
  }, [visibleSections, session?.did, isInitialised, storageKeyPrefix]);

  // function to toggle section visibility ensuring at least one section is visible
  const toggleSection = (id: T) => {
    setVisibleSections((prev) => {
      if (prev.has(id) && prev.size === 1) return prev;

      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return { visibleSections, toggleSection };
}
