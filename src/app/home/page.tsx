'use client';

import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "../../contexts/AuthContext";

export default function HomePage() {
    const router = useRouter();
    const { session, logout, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !session) {
            router.push('/');
        }
    }, [session, isLoading, router]);

    const handleLogout = async () => {
        await logout();
    };

    if (isLoading || !session) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-sky-500/30">
            <main className="max-w-4xl mx-auto px-6 py-12">
                <header className="flex flex-col md:flex-row items-center gap-4 mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                    <div className="flex items-center w-full md:w-auto gap-6 flex-1">
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent shrink-0">
                            ATtune
                        </h1>

                        <div className="relative max-w-md w-full md:w-64 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-zinc-400 group-focus-within:text-sky-500 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search"
                                className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-full leading-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            <a href="/profile" className="hover:text-sky-500 transition-colors">Profile</a>
                            <a href="/explore" className="hover:text-sky-500 transition-colors">Explore</a>
                            <a href="/releases" className="hover:text-sky-500 transition-colors">Releases</a>
                        </nav>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => location.replace('/record')}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-sm cursor-pointer"
                            >
                                <svg className="h-3 w-3 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="6" />
                                </svg>
                                Record
                            </button>

                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </header>
            </main>
        </div>
    );
}
