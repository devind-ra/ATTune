"use client";

// User home page content and functions

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { atApiService } from "~/lib/atproto";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import {
  getTopArtists,
  LastFMArtist,
  LastFMAlbum,
  getSimilarArtists,
  getTopAlbumsByTag,
} from "../../lib/lastfm";
import { getArtistName } from "../../lib/utils";

// Shuffle function
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Add to this when adding a new entry
// Sections for content placed on home page
const ALL_SECTIONS = [
  { id: "recommendedAlbums", label: "Recommended Albums" },
  { id: "recommendedArtists", label: "Recommended Artists" },
  { id: "topArtists", label: "Current Top Artists" },
] as const;

type SectionId = (typeof ALL_SECTIONS)[number]["id"];

// Skeleton component for loading state
const Skeleton = () => (
  <div className="animate-pulse flex space-x-4">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="h-24 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl"
      />
    ))}
  </div>
);

// Artist grid component
const ArtistGrid = ({ items }: { items: LastFMArtist[] }) =>
  items.length > 0 ? (
    <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item, idx) => (
        <li
          key={idx}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow relative"
        >
          <Link
            href={`/artist/${encodeURIComponent(item.name)}`}
            className="absolute inset-0 flex items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className="font-medium text-zinc-900 dark:text-zinc-100 text-center text-sm hover:text-sky-600 dark:hover:text-sky-400">
              {item.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  ) : (
    <Skeleton />
  );

// Album grid component
const AlbumGrid = ({ items }: { items: LastFMAlbum[] }) =>
  items.length > 0 ? (
    <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item, idx) => {
        const image =
          item.image?.find((img) => img.size === "large") ?? item.image?.[0];
        return (
          <li
            key={idx}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            {image?.["#text"] ? (
              <Image
                src={image["#text"]}
                alt={`${item.name} cover`}
                width={300}
                height={300}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="w-full aspect-square bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
                N/A
              </div>
            )}
            <div className="p-3 flex flex-col gap-1">
              <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm leading-tight line-clamp-2">
                {item.name}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                <Link
                  href={`/artist/${encodeURIComponent(getArtistName(item.artist))}`}
                  className="hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 px-1 -mx-1 rounded transition-colors"
                >
                  {getArtistName(item.artist)}
                </Link>
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  ) : (
    <Skeleton />
  );

// Home page function
export default function HomePage() {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  const [topArtists, setTopArtists] = useState<LastFMArtist[]>([]);
  const [recommendedArtists, setRecommendedArtists] = useState<LastFMArtist[]>(
    [],
  );
  const [recommendedAlbums, setRecommendedAlbums] = useState<LastFMAlbum[]>([]);

  const [visibleSections, setVisibleSections] = useState<Set<SectionId>>(
    () => new Set(ALL_SECTIONS.map((s) => s.id)),
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Toggle section visibility function
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

  // Handle click outside filter function
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/");
    }
    if (!session) return;

    // Load data from LastFM API
    async function loadData() {
      try {
        const tastes = await atApiService.getTastes(session!.did);
        if (tastes) {
          const artistResults: LastFMArtist[] = [];
          const albumResults: LastFMAlbum[] = [];

          for (const artist of tastes.topArtists || []) {
            const similarArtists = await getSimilarArtists(artist, "5");
            artistResults.push(...similarArtists);
          }

          for (const genre of tastes.topGenres || []) {
            const similarAlbums = await getTopAlbumsByTag(genre, "5");
            albumResults.push(...similarAlbums);
          }

          setRecommendedArtists(
            shuffle(
              Array.from(
                new Map(artistResults.map((a) => [a.name, a])).values(),
              ),
            ).slice(0, 5),
          );
          setRecommendedAlbums(
            shuffle(
              Array.from(
                new Map(
                  albumResults.map((a) => [a.name + a.artist, a]),
                ).values(),
              ),
            ).slice(0, 5),
          );
        }
        const [artists] = await Promise.all([getTopArtists()]);
        setTopArtists(artists);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [session, isLoading, router]);

  // Loading state
  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  // Add to this when adding new entry
  // Specified content for each section
  const sectionContent: Record<SectionId, React.ReactNode> = {
    recommendedAlbums: <AlbumGrid items={recommendedAlbums} />,
    recommendedArtists: <ArtistGrid items={recommendedArtists} />,
    topArtists: <ArtistGrid items={topArtists} />,
  };

  // Content for user home page
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />

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
                    onClick={() => toggleSection(id)}
                    disabled={isLast}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors
                      ${isLast ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"}
                      text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800 last:border-0
                    `}
                  >
                    <span className="font-medium">{label}</span>
                    <span
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200
                      ${active ? "bg-sky-600" : "bg-zinc-300 dark:bg-zinc-600"}
                    `}
                    >
                      <span
                        className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transform transition-transform duration-200
                        ${active ? "translate-x-4" : "translate-x-0.5"}
                      `}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {ALL_SECTIONS.filter((s) => visibleSections.has(s.id)).map(
          ({ id, label }) => (
            <section key={id} className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                {label}
              </h2>
              {sectionContent[id]}
            </section>
          ),
        )}
      </main>
    </div>
  );
}
