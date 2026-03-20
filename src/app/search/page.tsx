// Search Page
// Contains the following:
// - Page for displaying search results from Last.fm API data
// - Prioritises either Album or Artist based on relevance of search
// - Allows user to select artist or album to review

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import {
  searchArtist,
  searchAlbum,
  LastFMArtist,
  LastFMAlbum,
  LastFMImage,
} from "../../lib/lastfm";
import { getArtistName } from "../../lib/utils";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session, isLoading: authLoading } = useAuth();

  const getImageUrl = (
    imageArray: LastFMImage[] | undefined,
    preferredSize: string = "medium",
  ): string => {
    if (!imageArray || !Array.isArray(imageArray)) return "";
    const img =
      imageArray.find((i) => i.size === preferredSize) ?? imageArray[0];
    return img?.["#text"] ?? "";
  };

  const query = searchParams.get("q");

  const [artists, setArtists] = useState<LastFMArtist[]>([]);
  const [albums, setAlbums] = useState<LastFMAlbum[]>([]);
  const [primaryResultType, setPrimaryResultType] = useState<
    "artist" | "album"
  >("artist");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/");
    }
  }, [session, authLoading, router]);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const [artistResults, albumResults] = await Promise.all([
          searchArtist(query),
          searchAlbum(query),
        ]);

        const parsedArtists = Array.isArray(artistResults)
          ? artistResults.slice(0, 10)
          : artistResults
            ? [artistResults]
            : [];
        const parsedAlbums = Array.isArray(albumResults)
          ? albumResults.slice(0, 10)
          : albumResults
            ? [albumResults]
            : [];

        setArtists(parsedArtists);
        setAlbums(parsedAlbums);

        let artistPopularity = 0;

        if (parsedArtists.length > 0 && parsedArtists[0].listeners) {
          artistPopularity = parseInt(parsedArtists[0].listeners, 10);
        }

        const exactArtistMatch =
          parsedArtists.length > 0 &&
          parsedArtists[0].name.toLowerCase() === query.toLowerCase();
        const exactAlbumMatch =
          parsedAlbums.length > 0 &&
          parsedAlbums[0].name.toLowerCase() === query.toLowerCase();

        if (exactAlbumMatch && !exactArtistMatch) {
          setPrimaryResultType("album");
        } else if (exactArtistMatch && !exactAlbumMatch) {
          setPrimaryResultType("artist");
        } else {
          setPrimaryResultType(artistPopularity > 100000 ? "artist" : "album");
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, [query]);

  if (authLoading || !session) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar initialSearchQuery={query || ""} />

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {query ? `Search results for "${query}"` : "Enter a search term"}
          </h2>
        </div>

        {isSearching ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          </div>
        ) : (
          query && (
            <div className="space-y-12">
              {primaryResultType === "artist" ? (
                <>
                  <section>
                    <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      Artists
                    </h3>
                    {artists.length > 0 ? (
                      <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {artists.map((artist, idx) => {
                          return (
                            <li
                              key={idx}
                              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow relative"
                            >
                              <Link
                                href={`/artist/${encodeURIComponent(artist.name)}`}
                                className="absolute inset-0 flex items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              >
                                <span className="font-medium text-zinc-900 dark:text-zinc-100 text-center text-sm hover:text-sky-600 dark:hover:text-sky-400">
                                  {artist.name}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-zinc-500 text-sm">No artists found.</p>
                    )}
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      Albums
                    </h3>
                    {albums.length > 0 ? (
                      <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {albums.map((album, idx) => {
                          const imgUrl = getImageUrl(album.image, "large");
                          return (
                            <li
                              key={idx}
                              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-3 items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center group h-full relative"
                            >
                              <div className="shrink-0">
                                {imgUrl ? (
                                  <Image
                                    src={imgUrl}
                                    alt={album.name}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 rounded-md object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-20 h-20 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                                    <svg
                                      className="w-8 h-8 text-zinc-400"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7.5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-center justify-start flex-1 w-full">
                                <span className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 w-full">
                                  <Link
                                    href={`/album/${encodeURIComponent(getArtistName(album.artist))}/${encodeURIComponent(album.name)}`}
                                    className="hover:underline decoration-zinc-400 dark:decoration-zinc-500 after:absolute after:inset-0"
                                  >
                                    <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                      {album.name}
                                    </h4>
                                  </Link>
                                </span>
                                <span className="text-xs text-zinc-500 line-clamp-1 w-full mt-1 relative z-10">
                                  <Link
                                    href={`/artist/${encodeURIComponent(getArtistName(album.artist))}`}
                                    className="hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 px-1 -mx-1 rounded transition-colors inline-block"
                                  >
                                    {getArtistName(album.artist)}
                                  </Link>
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-zinc-500 text-sm">No albums found.</p>
                    )}
                  </section>
                </>
              ) : (
                <>
                  <section>
                    <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      Albums
                    </h3>
                    {albums.length > 0 ? (
                      <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {albums.map((album, idx) => {
                          const imgUrl = getImageUrl(album.image, "large");
                          return (
                            <li
                              key={idx}
                              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-3 items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center group h-full"
                            >
                              <div className="shrink-0">
                                {imgUrl ? (
                                  <Image
                                    src={imgUrl}
                                    alt={album.name}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 rounded-md object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-20 h-20 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                                    <svg
                                      className="w-8 h-8 text-zinc-400"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7.5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-center justify-start flex-1 w-full">
                                <span className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 w-full">
                                  <Link
                                    href={`/album/${encodeURIComponent(getArtistName(album.artist))}/${encodeURIComponent(album.name)}`}
                                    className="hover:underline decoration-zinc-400 dark:decoration-zinc-500 after:absolute after:inset-0"
                                  >
                                    <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                      {album.name}
                                    </h4>
                                  </Link>
                                </span>
                                <span className="text-xs text-zinc-500 line-clamp-1 w-full mt-1 relative z-10">
                                  <Link
                                    href={`/artist/${encodeURIComponent(getArtistName(album.artist))}`}
                                    className="hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 px-1 -mx-1 rounded transition-colors inline-block"
                                  >
                                    {getArtistName(album.artist)}
                                  </Link>
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-zinc-500 text-sm">No albums found.</p>
                    )}
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      Artists
                    </h3>
                    {artists.length > 0 ? (
                      <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {artists.map((artist, idx) => (
                          <li
                            key={idx}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow relative"
                          >
                            <Link
                              href={`/artist/${encodeURIComponent(artist.name)}`}
                              className="absolute inset-0 flex items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <span className="font-medium text-zinc-900 dark:text-zinc-100 text-center text-sm hover:text-sky-600 dark:hover:text-sky-400">
                                {artist.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-zinc-500 text-sm">No artists found.</p>
                    )}
                  </section>
                </>
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
