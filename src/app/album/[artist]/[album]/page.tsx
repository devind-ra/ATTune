// Album template page
// Contains the following:
// - Calls Album header, tags, wiki, and review components
// - Uses useAlbumPage hook to fetch album data
// - Uses parseImage, parseReleaseDate, cleanWiki utils to parse album data

"use client";

import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useAlbumPage } from "@/app/hooks/useAlbumPage";
import { AlbumHeader } from "@/components/album/AlbumHeader";
import { AlbumTags } from "@/components/album/AlbumTags";
import { AlbumWiki } from "@/components/album/AlbumWiki";
import { ReviewSection } from "@/components/album/ReviewSection";
import { parseImage, parseReleaseDate, cleanWiki } from "@/lib/utils";

export default function AlbumPage() {
  const params = useParams();
  const artistName = decodeURIComponent((params.artist as string) ?? "");
  const albumName = decodeURIComponent((params.album as string) ?? "");

  const { session } = useAuth();
  const { albumInfo, tags, isLoading } = useAlbumPage(artistName, albumName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );
  }

  if (!albumInfo) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
        <main className="max-w-4xl mx-auto px-6 py-12">
          <Navbar />
          <div className="mt-8 text-center text-zinc-500">Album not found.</div>
        </main>
      </div>
    );
  }

  const img = parseImage(albumInfo.image);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />

        <div className="mt-8 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col items-center p-8 md:p-12 text-center">
          <div className="w-full max-w-2xl flex flex-col items-center">
            <AlbumHeader
              name={albumInfo.name}
              artist={albumInfo.artist}
              img={img}
              releaseDate={parseReleaseDate(albumInfo.wiki?.published)}
            />
            <AlbumTags tags={tags} />
            <AlbumWiki
              html={cleanWiki(albumInfo.wiki?.summary)}
              url={albumInfo.url}
            />
          </div>
        </div>

        {session && (
          <ReviewSection
            albumName={albumName}
            artistName={artistName}
            img={img}
            albumDisplayName={albumInfo.name}
            artistDisplayName={albumInfo.artist}
          />
        )}
      </main>
    </div>
  );
}
