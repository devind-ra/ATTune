"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Navbar from "../../../../components/Navbar";
import ReviewList from "../../../../components/ReviewList";
import ReviewForm from "../../../../components/ReviewForm";
import { getAlbumInfo, getAlbumTopTags, LastFMAlbumInfo, LastFMImage, LastFMTag } from "../../../../lib/lastfm";
import { useAuth } from "../../../../contexts/AuthContext";

export default function AlbumPage() {
  const params = useParams();
  const artistName = params.artist ? decodeURIComponent(params.artist as string) : "";
  const albumName = params.album ? decodeURIComponent(params.album as string) : "";

  const { session } = useAuth();
  const [albumInfo, setAlbumInfo] = useState<LastFMAlbumInfo>();
  const [tags, setTags] = useState<LastFMTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  const handleReviewCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setIsReviewFormOpen(false);
  };

  useEffect(() => {
    if (!artistName || !albumName) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const [info, toptags] = await Promise.all([
          getAlbumInfo(artistName, albumName),
          getAlbumTopTags(artistName, albumName),
        ]);
        setAlbumInfo(info);
        setTags(toptags);
      } catch (err) {
        console.error("Failed to load album data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [artistName, albumName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!albumInfo) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
        <main className="max-w-4xl mx-auto px-6 py-12">
          <Navbar />
          <div className="mt-8 text-center text-zinc-500">
            Album not found.
          </div>
        </main>
      </div>
    );
  }

  const img =
    albumInfo.image?.find((i: LastFMImage) => i.size === "extralarge") ??
    albumInfo.image?.find((i: LastFMImage) => i.size === "large") ??
    albumInfo.image?.[0];

  const releaseDate = albumInfo.wiki?.published || "Release date unknown";

  // Clean up wiki text to remove the "Read more on Last.fm" link
  const wikiContent =
    albumInfo.wiki?.summary?.replace(
      /<a href="https:\/\/www\.last\.fm[^>]+>Read more on Last\.fm<\/a>/g,
      ""
    ) || "";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />

        <div className="mt-8 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col items-center p-8 md:p-12 text-center">
          <div className="relative w-48 md:w-64 aspect-square rounded-2xl overflow-hidden shadow-md mb-8">
            {img?.["#text"] ? (
              <Image
                src={img["#text"]}
                alt={`${albumInfo.name} cover`}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                N/A
              </div>
            )}
          </div>

          <div className="w-full max-w-2xl flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {albumInfo.name}
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-4 font-medium">
              {albumInfo.artist}
            </p>

            <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Released: {releaseDate.includes(",") ? releaseDate.split(",")[0] : releaseDate}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {tags.slice(0, 8).map((tag: LastFMTag, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-full text-xs font-medium border border-sky-100 dark:border-sky-800"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {wikiContent && (
              <div
                className="prose dark:prose-invert prose-zinc prose-sm max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar text-center px-4"
                dangerouslySetInnerHTML={{ __html: wikiContent }}
              />
            )}
            {albumInfo.url && (
              <a
                href={albumInfo.url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 inline-block w-fit"
              >
                View full album on Last.fm →
              </a>
            )}
          </div>
        </div>

        {session && (
          <div className="mt-8">
            {!isReviewFormOpen ? (
              <button
                onClick={() => setIsReviewFormOpen(true)}
                className="w-full py-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add a Review
              </button>
            ) : (
              <ReviewForm
                onReviewCreated={handleReviewCreated}
                onCancel={() => setIsReviewFormOpen(false)}
                initialTitle={albumInfo.name}
                initialArtist={albumInfo.artist}
                initialImage={img?.["#text"]}
              />
            )}
          </div>
        )}

        {session && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
              Your Reviews
              <span className="text-xs font-normal px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500">
                {session.handle}
              </span>
            </h2>
            <ReviewList
              did={session.did}
              refreshTrigger={refreshTrigger}
              filterTitle={albumName}
              filterArtist={artistName}
            />
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
