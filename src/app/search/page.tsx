'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from "../../contexts/AuthContext";
import { searchArtist, searchAlbum, LastFMArtist, LastFMAlbum, LastFMImage } from '../../lib/lastfm';

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { session, logout, isLoading: authLoading } = useAuth();

    const getImageUrl = (imageArray: LastFMImage[] | undefined, preferredSize: string = 'medium'): string => {
        if (!imageArray || !Array.isArray(imageArray)) return '';
        const img = imageArray.find(i => i.size === preferredSize) ?? imageArray[0];
        return img?.['#text'] ?? '';
    };

    const query = searchParams.get('q');

    const [artists, setArtists] = useState<LastFMArtist[]>([]);
    const [albums, setAlbums] = useState<LastFMAlbum[]>([]);
    const [primaryResultType, setPrimaryResultType] = useState<'artist' | 'album'>('artist');
    const [isSearching, setIsSearching] = useState(false);
    const [searchInput, setSearchInput] = useState(query || '');

    useEffect(() => {
        if (!authLoading && !session) {
            router.push('/');
        }
    }, [session, authLoading, router]);

    useEffect(() => {
        if (!query) return;

        const fetchResults = async () => {
            setIsSearching(true);
            try {
                const [artistResults, albumResults] = await Promise.all([
                    searchArtist(query),
                    searchAlbum(query)
                ]);

                const parsedArtists = Array.isArray(artistResults) ? artistResults.slice(0, 10) : artistResults ? [artistResults] : [];
                const parsedAlbums = Array.isArray(albumResults) ? albumResults.slice(0, 10) : albumResults ? [albumResults] : [];

                setArtists(parsedArtists);
                setAlbums(parsedAlbums);

                let artistPopularity = 0;

                if (parsedArtists.length > 0 && parsedArtists[0].listeners) {
                    artistPopularity = parseInt(parsedArtists[0].listeners, 10);
                }

                const exactArtistMatch = parsedArtists.length > 0 && parsedArtists[0].name.toLowerCase() === query.toLowerCase();
                const exactAlbumMatch = parsedAlbums.length > 0 && parsedAlbums[0].name.toLowerCase() === query.toLowerCase();

                if (exactAlbumMatch && !exactArtistMatch) {
                    setPrimaryResultType('album');
                } else if (exactArtistMatch && !exactAlbumMatch) {
                    setPrimaryResultType('artist');
                } else {
                    setPrimaryResultType(artistPopularity > 100000 ? 'artist' : 'album');
                }

            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        };

        fetchResults();
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
        }
    };

    if (authLoading || !session) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-sky-500/30">
            <main className="max-w-4xl mx-auto px-6 py-12">
                <header className="flex flex-col md:flex-row items-center gap-4 mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                    <div className="flex items-center w-full md:w-auto gap-6 flex-1">
                        <h1
                            onClick={() => router.push('/home')}
                            className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            ATtune
                        </h1>

                        <form onSubmit={handleSearch} className="relative max-w-md w-full md:w-64 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-zinc-400 group-focus-within:text-sky-500 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search artists, albums..."
                                className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-full leading-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-all shadow-sm"
                            />
                        </form>
                    </div>

                    <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            <a href="/profile" className="hover:text-sky-500 transition-colors">Profile</a>
                            <a href="/explore" className="hover:text-sky-500 transition-colors">Explore</a>
                            <a href="/releases" className="hover:text-sky-500 transition-colors">Releases</a>
                        </nav>

                        <button
                            onClick={() => logout()}
                            className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                            Sign Out
                        </button>
                    </div>
                </header>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {query ? `Search results for "${query}"` : 'Enter a search term'}
                    </h2>
                </div>

                {isSearching ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                    </div>
                ) : query && (
                    <div className="space-y-12">
                        {primaryResultType === 'artist' ? (
                            <>
                                <section>
                                    <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                        Artists
                                    </h3>
                                    {artists.length > 0 ? (
                                        <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            {artists.map((artist, idx) => {
                                                return (
                                                    <li key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-full justify-center">
                                                        <span className="font-medium text-zinc-900 dark:text-zinc-100 text-center line-clamp-2 w-full">
                                                            {artist.name}
                                                        </span>
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
                                                const imgUrl = getImageUrl(album.image, 'large');
                                                return (
                                                    <li key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-3 items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center group h-full">
                                                        <div className="shrink-0">
                                                            {imgUrl ? (
                                                                <Image src={imgUrl} alt={album.name} width={80} height={80} className="w-20 h-20 rounded-md object-cover shadow-sm group-hover:scale-105 transition-transform duration-300" unoptimized />
                                                            ) : (
                                                                <div className="w-20 h-20 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                                                                    <svg className="w-8 h-8 text-zinc-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7.5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-center justify-start flex-1 w-full">
                                                            <span className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 w-full">
                                                                {album.name}
                                                            </span>
                                                            <span className="text-xs text-zinc-500 line-clamp-1 w-full mt-1">
                                                                {album.artist}
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
                                                const imgUrl = getImageUrl(album.image, 'large');
                                                return (
                                                    <li key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-3 items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center group h-full">
                                                        <div className="shrink-0">
                                                            {imgUrl ? (
                                                                <Image src={imgUrl} alt={album.name} width={80} height={80} className="w-20 h-20 rounded-md object-cover shadow-sm group-hover:scale-105 transition-transform duration-300" unoptimized />
                                                            ) : (
                                                                <div className="w-20 h-20 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                                                                    <svg className="w-8 h-8 text-zinc-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7.5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-center justify-start flex-1 w-full">
                                                            <span className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 w-full">
                                                                {album.name}
                                                            </span>
                                                            <span className="text-xs text-zinc-500 line-clamp-1 w-full mt-1">
                                                                {album.artist}
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
                                                <li key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-full justify-center">
                                                    <span className="font-medium text-zinc-900 dark:text-zinc-100 text-center line-clamp-2 w-full">
                                                        {artist.name}
                                                    </span>
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
                )}
            </main>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            </div>
        }>
            <SearchResults />
        </Suspense>
    );
}
