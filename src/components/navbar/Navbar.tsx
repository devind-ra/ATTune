// Navbar component
// Contains the following:
// - Calls NavSearchForm component for search bar
// - Calls NavActions component for navigation actions
// - Handles mobile menu toggle

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { NavSearchForm } from "./NavSearchForm";
import { NavActions } from "./NavActions";
import Image from "next/image";

interface NavbarProps {
  initialSearchQuery?: string;
}

// eslint-disable-next-line max-lines-per-function
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
    if (searchQuery.trim())
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center gap-4 mb-12 border-b border-zinc-800 pb-6 relative">
      <div className="flex items-center justify-between w-full md:w-auto flex-1 gap-6">
        <h1
          onClick={() => router.push("/home")}
          className="text-3xl font-bold tracking-tight bg-clip-text text-white shrink-0 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2"
        >
          <Image src="/ATtune-logo.png" width={32} height={32} alt="ATtune logo" className="h-8 w-auto" />
          ATtune
        </h1>
        <NavSearchForm
          searchQuery={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearch}
          className="hidden md:block max-w-md w-full md:w-64"
        />
        <button
          className="md:hidden text-zinc-500 hover:text-zinc-200 p-2 -mr-2 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md transition-colors"
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
        className={`${isMobileMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end`}
      >
        <NavSearchForm
          searchQuery={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearch}
          className="md:hidden w-full mb-2"
        />
        <NavActions onLogout={logout} />
      </div>
    </header>
  );
}
