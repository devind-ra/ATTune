// Settings Page
// Contains the following:
// - Data privacy policies
// - Third party services
// - Account data handling
// - Permanent data deletion of reviews/tastes

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/navbar/Navbar";
import ReactMarkdown from "react-markdown";
import { components } from "~/lib/markdown_components";
import SettingsModal from "@/components/settings/SettingsModal";

export default function SettingsPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  const [markdownContent, setMarkdownContent] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/");
    }
  }, [session, isLoading, router]);

  useEffect(() => {
    fetch("/settings.md")
      .then((res) => res.text())
      .then((text) => setMarkdownContent(text))
      .catch((err) => console.error("Failed to load settings content:", err));
  }, []);

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-sky-500/30">
      <div className="pt-8 px-6">
        <div className="max-w-4xl mx-auto">
          <Navbar />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 pb-12">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium transition-colors mb-8 bg-transparent border-none p-0 cursor-pointer"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </button>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
          <div className="flex flex-col text-zinc-800 dark:text-zinc-200 leading-relaxed max-w-none">
            <ReactMarkdown components={components}>
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>

        <div className="mt-8 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
              Danger Zone
            </h2>
            <p className="text-red-600/80 dark:text-red-400/80 text-sm">
              Permanently wipe all your reviews and tastes. This action cannot
              be undone.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Wipe All Data
          </button>
        </div>
      </main>

      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
