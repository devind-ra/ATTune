// Artist Page
// Contains the following:
// - Calls for ArtistHeader, TopTracks, AlbumGrid components
"use client";

import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ArtistHeader } from "@/components/artist/ArtistHeader";
import { TopTracksList } from "@/components/artist/TopTracksList";
import { AlbumGrid } from "@/components/artist/AlbumGrid";
import { useArtistData } from "@/app/hooks/useArtistData";

export default function ArtistPage() {
  const params = useParams();
  const artistName = params.name
    ? decodeURIComponent(params.name as string)
    : "";
  const { artistInfo, topTracks, topAlbums, isLoading } =
    useArtistData(artistName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />
        <ArtistHeader artistInfo={artistInfo} />
        <TopTracksList tracks={topTracks} />
        <AlbumGrid albums={topAlbums} />
      </main>
    </div>
  );
}
