// Sections library
// Contains the following:
// - List of all sections which can be edited on the home page with toggles
// - Utilises state to ensure filter consistency is maintained

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const ALL_SECTIONS = [
  { id: "tagArtists", label: "Recommended Artists by Taste" },
  { id: "recommendedArtists", label: "Similar Artists by Taste" },
  { id: "recommendedAlbums", label: "Recommended Albums" },
  { id: "musicPublications", label: "Music Publications on Bluesky" },
] as const;

export type SectionId = (typeof ALL_SECTIONS)[number]["id"];

export function useVisibleSections() {
  const { session } = useAuth();

  const [visibleSections, setVisibleSections] = useState<Set<SectionId>>(
    () => new Set(ALL_SECTIONS.map((s) => s.id)),
  );

  const [isInitialised, setIsInitialised] = useState(false);

  useEffect(() => {
    if (!session?.did) return;

    try {
      const stored = localStorage.getItem(`attune_sections_${session.did}`);
      if (stored) {
        const parsedIds = JSON.parse(stored) as string[];
        const validIds = parsedIds.filter((id) =>
          ALL_SECTIONS.some((s) => s.id === id),
        ) as SectionId[];

        if (validIds.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setVisibleSections(new Set(validIds));
        }
      }
    } catch (e) {
      console.error("Failed to parse stored section preferences:", e);
    }

    setIsInitialised(true);
  }, [session?.did]);

  useEffect(() => {
    if (!session?.did || !isInitialised) return;

    localStorage.setItem(
      `attune_sections_${session.did}`,
      JSON.stringify(Array.from(visibleSections)),
    );
  }, [visibleSections, session?.did, isInitialised]);

  const toggleSection = (id: SectionId) => {
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
