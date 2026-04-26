// Record Page
// Contains the following:
// - Integrates ReviewForm and ReviewList components

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ReviewList from "@/components/review/ReviewList";
import ReviewForm from "@/components/review/ReviewForm";
import Navbar from "@/components/navbar/Navbar";

export default function RecordPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/");
    }
  }, [session, isLoading, router]);

  const handleReviewCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />

        <ReviewForm onReviewCreated={handleReviewCreated} />

        <div>
          <h2 className="text-2xl font-bold mb-6 text-zinc-100 flex items-center gap-2">
            Your Reviews
            <span className="text-xs font-normal px-2 py-1 bg-zinc-800 rounded-full text-zinc-100">
              {session.handle}
            </span>
          </h2>
          <ReviewList did={session.did} refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  );
}
