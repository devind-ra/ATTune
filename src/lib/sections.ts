// Sections library
// Contains the following:
// - List of all sections which can be edited on the home page with toggles

import { useState } from "react";

export const ALL_SECTIONS = [
  { id: "recommendedAlbums", label: "Recommended Albums" },
  { id: "recommendedArtists", label: "Recommended Artists" },
  { id: "topArtists", label: "Current Top Artists" },
] as const;

export type SectionId = (typeof ALL_SECTIONS)[number]["id"];

export function useVisibleSections() {
  const [visibleSections, setVisibleSections] = useState<Set<SectionId>>(
    () => new Set(ALL_SECTIONS.map((s) => s.id)),
  );

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
