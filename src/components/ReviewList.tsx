'use client';

import { useEffect, useState, useCallback } from 'react';
import { atApiService, MusicReview } from '../lib/atproto';

interface ReviewListProps {
    did: string;
    refreshTrigger: number;
}

export default function ReviewList({ did, refreshTrigger }: ReviewListProps) {
    const [reviews, setReviews] = useState<{ uri: string; value: MusicReview }[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        try {
            const data = await atApiService.getReviews(did);
            // Sort by createdAt descending
            const sorted = data.sort((a, b) =>
                new Date(b.value.createdAt).getTime() - new Date(a.value.createdAt).getTime()
            );
            setReviews(sorted);
        } catch (err) {
            console.error('Failed to fetch reviews', err);
        } finally {
            setLoading(false);
        }
    }, [did]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews, refreshTrigger]);

    if (loading) {
        return <div className="text-center py-10 text-zinc-500">Loading reviews...</div>;
    }

    if (reviews.length === 0) {
        return <div className="text-center py-10 text-zinc-500">No reviews yet. Be the first!</div>;
    }

    return (
        <div className="space-y-4">
            {reviews.map((item) => (
                <div
                    key={item.uri}
                    className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                {item.value.subjectTitle}
                            </h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                by {item.value.subjectArtist}
                            </p>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.value.rating}</span>
                        </div>
                    </div>

                    {item.value.text && (
                        <p className="text-zinc-700 dark:text-zinc-300 mt-2 text-sm leading-relaxed">
                            {item.value.text}
                        </p>
                    )}

                    <div className="mt-4 text-xs text-zinc-400">
                        {new Date(item.value.createdAt).toLocaleDateString()}
                    </div>
                </div>
            ))}
        </div>
    );
}
