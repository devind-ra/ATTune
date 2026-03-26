// SectionFilter component
// Contains the following:
// - Filter button which opens a dropdown menu to filter sections
// - Dropdown menu with toggles for each section

import { useState } from "react";
import { ALL_SECTIONS, SectionId } from "@/lib/sections";
import { useClickOutside } from "@/app/hooks/useClickOutside";

interface Props {
  visibleSections: Set<SectionId>;
  onToggle: (id: SectionId) => void;
}

export function SectionFilter({ visibleSections, onToggle }: Props) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useClickOutside<HTMLDivElement>(() => setFilterOpen(false));

  return (
    <div className="mt-8 relative" ref={filterRef}>
      <button
        onClick={() => setFilterOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors cursor-pointer shadow-sm"
      >
        <span>Filter Sections</span>
        <span className="text-xs bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded-full">
          {visibleSections.size}
        </span>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform ${filterOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {filterOpen && (
        <div className="absolute z-20 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden">
          {ALL_SECTIONS.map(({ id, label }) => {
            const active = visibleSections.has(id);
            const isLast = visibleSections.size === 1 && active;
            return (
              <button
                key={id}
                onClick={() => onToggle(id)}
                disabled={isLast}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors
                  ${isLast ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"}
                  text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800 last:border-0`}
              >
                <span className="font-medium">{label}</span>
                <span
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ${active ? "bg-sky-600" : "bg-zinc-300 dark:bg-zinc-600"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transform transition-transform duration-200 ${active ? "translate-x-4" : "translate-x-0.5"}`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
