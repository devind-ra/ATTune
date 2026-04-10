// Reviews Page
// Contains the following:
// - Calls ReviewList component to display reviews

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ReviewList from "@/components/review/ReviewList";
import Navbar from "@/components/navbar/Navbar";

export default function ReviewsPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [refreshTrigger] = useState(0);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/");
    }
  }, [session, isLoading, router]);

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
        <Navbar />

        <a
          href="/profile"
          className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors"
        >
          Back to Profile
        </a>
        <br />
        <div>
          <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Your Reviews
            <span className="text-xs font-normal px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500">
              {session.handle}
            </span>
          </h2>
          <ReviewList did={session.did} refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  );
}
