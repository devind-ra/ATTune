// SectionFilter component
// Contains the following:
// - Filter button which opens a dropdown menu to filter sections
// - Dropdown menu with toggles for each section

import { useState } from "react";
import { useClickOutside } from "@/app/hooks/useClickOutside";

// props passed to section filter
interface Props<T extends string> {
  sections: readonly { id: T; label: string }[];
  visibleSections: Set<T>;
  onToggle: (id: T) => void;
}

// eslint-disable-next-line max-lines-per-function
export function SectionFilter<T extends string>({
  sections,
  visibleSections,
  onToggle,
}: Props<T>) {
  // constants for filters dropdown menu
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useClickOutside<HTMLDivElement>(() => setFilterOpen(false));

  // content called to display filter button for dropdown
  // has toggles for each section which can be turned on or off with interaction
  return (
    <div className="mt-8 relative" ref={filterRef}>
      <button
        onClick={() => setFilterOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm font-medium text-zinc-100 hover:border-zinc-600 transition-colors cursor-pointer shadow-sm"
      >
        <span>Filter Sections</span>
        <span className="text-xs bg-sky-900/40 text-sky-400 px-1.5 py-0.5 rounded-full">
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
        <div className="absolute z-20 mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-lg overflow-hidden">
          {sections.map(({ id, label }) => {
            const active = visibleSections.has(id);
            const isLast = visibleSections.size === 1 && active;
            return (
              <button
                key={id}
                onClick={() => onToggle(id)}
                disabled={isLast}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors
                  ${isLast ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-zinc-800"}
                  text-zinc-100 border-b border-zinc-800 last:border-0`}
              >
                <span className="font-medium">{label}</span>
                <span
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ${active ? "bg-sky-600" : "bg-zinc-600"}`}
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
