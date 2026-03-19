// Artist Page
// Contains the following:
// - Retrieves data from Last.fm API for a specific artist
// - Displays artist information, top tracks, and top albums

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Navbar from "../../../components/Navbar";
import {
  getArtistInfo,
  getArtistTopTracks,
  getArtistTopAlbums,
  LastFMTrack,
  LastFMAlbum,
  LastFMTag,
  LastFMArtistInfo,
} from "../../../lib/lastfm";
import { getArtistName } from "../../../lib/utils";

export default function ArtistPage() {
  const params = useParams();
  const artistName = params.name
    ? decodeURIComponent(params.name as string)
    : "";

  const [artistInfo, setArtistInfo] = useState<LastFMArtistInfo | null>(null);
  const [topTracks, setTopTracks] = useState<LastFMTrack[]>([]);
  const [topAlbums, setTopAlbums] = useState<LastFMAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!artistName) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const [info, tracks, albums] = await Promise.all([
          getArtistInfo(artistName),
          getArtistTopTracks(artistName, "5"),
          getArtistTopAlbums(artistName, "10"),
        ]);
        setArtistInfo(info);
        setTopTracks(tracks);
        setTopAlbums(albums);
      } catch (err) {
        console.error("Failed to load artist data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [artistName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!artistInfo) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
        <main className="max-w-4xl mx-auto px-6 py-12">
          <Navbar />
          <div className="mt-8 text-center text-zinc-500">
            Artist not found.
          </div>
        </main>
      </div>
    );
  }

  const stats = artistInfo.stats || {};
  const tags = artistInfo.tags?.tag || [];

  // Clean up bio text to remove the "Read more on Last.fm" link
  const bioContent =
    artistInfo.bio?.summary?.replace(
      /<a href="https:\/\/www\.last\.fm[^>]+>Read more on Last\.fm<\/a>/g,
      "",
    ) || "No biography available.";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />

        <div className="mt-8 relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="p-8 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {artistInfo.name}
            </h1>

            {(stats.listeners || stats.playcount) && (
              <div className="flex gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-6 font-medium">
                {stats.listeners && (
                  <span>
                    {parseInt(stats.listeners).toLocaleString()} Listeners
                  </span>
                )}
                {stats.playcount && (
                  <span>
                    {parseInt(stats.playcount).toLocaleString()} Scrobbles
                  </span>
                )}
              </div>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.slice(0, 5).map((tag: LastFMTag, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-full text-xs font-medium border border-sky-100 dark:border-sky-800"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div
              className="prose dark:prose-invert prose-zinc prose-sm max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed max-h-48 overflow-y-auto pr-2 custom-scrollbar"
              dangerouslySetInnerHTML={{ __html: bioContent }}
            />
            {artistInfo.url && (
              <a
                href={artistInfo.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 inline-block w-fit"
              >
                View full profile on Last.fm →
              </a>
            )}
          </div>
        </div>

        {topTracks.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
              Top Tracks
            </h2>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {topTracks.map((track, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="w-6 text-center font-medium text-zinc-400">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {track.name}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                        {getArtistName(track.artist)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {topAlbums.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
              Discography
            </h2>
            <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {topAlbums.map((item, idx) => {
                const img =
                  item.image?.find((i) => i.size === "extralarge") ??
                  item.image?.find((i) => i.size === "large") ??
                  item.image?.[0];

                return (
                  <li
                    key={idx}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group"
                  >
                    <div className="relative aspect-square">
                      {img?.["#text"] ? (
                        <Image
                          src={img["#text"]}
                          alt={`${item.name} cover`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-sm leading-tight line-clamp-2">
                        {item.name}
                      </h3>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <style jsx global>
          {`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: #d4d4d8;
              border-radius: 4px;
            }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: #3f3f46;
            }
          `}
        </style>
      </main>
    </div>
  );
}
