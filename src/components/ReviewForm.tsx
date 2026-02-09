'use client';

import { useState } from 'react';
import { atApiService } from '../lib/atproto';

interface ReviewFormProps {
    onReviewCreated: () => void;
}

export default function ReviewForm({ onReviewCreated }: ReviewFormProps) {
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await atApiService.createReview({
                subjectTitle: title,
                subjectArtist: artist,
                rating: Number(rating),
                text: text,
            });

            // Reset form
            setTitle('');
            setArtist('');
            setRating(5);
            setText('');

            onReviewCreated();
        } catch (err: unknown) {
            console.error('Failed to create review', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to create review');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Add a Review</h3>

            {error && (
                <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                            Song/Album Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                            Artist
                        </label>
                        <input
                            type="text"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                        Rating ({rating}/10)
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <div className="flex justify-between text-xs text-zinc-500 mt-1">
                        <span>1</span>
                        <span>10</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                        Review
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all resize-none"
                        placeholder="What did you think?"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Posting...' : 'Post Review'}
                    </button>
                </div>
            </form>
        </div>
    );
}
