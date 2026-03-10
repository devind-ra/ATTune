"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

interface NavbarProps {
  initialSearchQuery?: string;
}

export default function Navbar({ initialSearchQuery = "" }: NavbarProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center gap-4 mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-6 relative">
      <div className="flex items-center justify-between w-full md:w-auto flex-1 gap-6">
        <h1
          onClick={() => router.push("/home")}
          className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          ATtune
        </h1>

        <form
          onSubmit={handleSearch}
          className="hidden md:block relative max-w-md w-full md:w-64 group"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-zinc-400 group-focus-within:text-sky-500 transition-colors"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artists, albums..."
            className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-full leading-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-all shadow-sm"
          />
        </form>

        <button
          className="md:hidden text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 p-2 -mr-2 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`${
          isMobileMenuOpen ? "flex" : "hidden"
        } md:flex flex-col md:flex-row items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end transition-all`}
      >
        <form
          onSubmit={handleSearch}
          className="md:hidden relative w-full group mb-2"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-zinc-400 group-focus-within:text-sky-500 transition-colors"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artists, albums..."
            className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-full leading-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-all shadow-sm"
          />
        </form>

        <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400 w-full md:w-auto">
          <a
            href="/profile"
            className="hover:text-sky-500 transition-colors w-full md:w-auto text-center md:text-left py-2 md:py-0"
          >
            Profile
          </a>
          <a
            href="/explore"
            className="hover:text-sky-500 transition-colors w-full md:w-auto text-center md:text-left py-2 md:py-0"
          >
            Explore
          </a>
          <a
            href="/releases"
            className="hover:text-sky-500 transition-colors w-full md:w-auto text-center md:text-left py-2 md:py-0"
          >
            Releases
          </a>
        </nav>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => location.replace("/record")}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-sm cursor-pointer w-full sm:w-auto"
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

          <button
            onClick={handleLogout}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer w-full sm:w-auto py-2 md:py-0"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
