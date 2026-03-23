// ReviewSection component
// Contains the following: 
// - Review form for adding reviews from album page
// - Review list for displaying user reviews

import { useState } from "react";
import ReviewForm from "../ReviewForm";
import ReviewList from "../ReviewList";
import { useAuth } from "../../contexts/AuthContext";
import { LastFMImage } from "../../lib/lastfm";

interface Props {
    albumName: string;
    artistName: string;
    img: LastFMImage | undefined;
    albumDisplayName: string;
    artistDisplayName: string;
}

export function ReviewSection({ albumName, artistName, img, albumDisplayName, artistDisplayName }: Props) {
    const { session } = useAuth();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    if (!session) return null;

    const handleReviewCreated = () => {
        setRefreshTrigger((prev) => prev + 1);
        setIsFormOpen(false);
    };

    return (
        <>
            <div className="mt-8">
                {isFormOpen ? (
                    <ReviewForm
                        onReviewCreated={handleReviewCreated}
                        onCancel={() => setIsFormOpen(false)}
                        initialTitle={albumDisplayName}
                        initialArtist={artistDisplayName}
                        initialImage={img?.["#text"]}
                    />
                ) : (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="w-full py-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add a Review
                    </button>
                )}
            </div>

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
        </>
    );
}