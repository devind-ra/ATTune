// NavActions component
// Contains the following:
// - Navigation actions for the application

"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  onLogout: () => void;
}

// eslint-disable-next-line max-lines-per-function
export function NavActions({ onLogout }: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
      <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm font-medium text-white w-full md:w-auto">
        <a
          href="/profile"
          aria-label="Profile"
          className="hover:text-sky-500 transition-colors w-full md:w-auto text-center md:text-left py-2 md:py-0"
        >
          Profile
        </a>
        <a
          href="/explore"
          aria-label="Explore"
          className="hover:text-sky-500 transition-colors w-full md:w-auto text-center md:text-left py-2 md:py-0"
        >
          Explore
        </a>
      </nav>
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-zinc-800">
        <button
          onClick={() => location.replace("/record")}
          aria-label="Record Album"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-red-950 hover:bg-red-900 text-white text-sm font-medium transition-colors shadow-sm cursor-pointer w-full sm:w-auto"
        >
          <svg
            className="h-3 w-3 animate-pulse"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="6" />
          </svg>
          Record
        </button>
        <div
          className="relative w-full sm:w-auto flex flex-col items-center"
          ref={dropdownRef}
        >
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Open Account Menu"
            className="flex items-center justify-center gap-2 text-sm font-medium text-white hover:text-zinc-200 transition-colors cursor-pointer w-full sm:w-auto py-2 md:py-0 focus:outline-none"
          >
            Account
            <svg
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full mt-2 w-48 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 py-2 z-50 flex flex-col md:right-0">
              <a
                href="/settings"
                aria-label="Settings"
                className="px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors text-left"
                onClick={() => setIsDropdownOpen(false)}
              >
                Settings
              </a>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onLogout();
                }}
                aria-label="Sign Out"
                className="px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors text-left cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
