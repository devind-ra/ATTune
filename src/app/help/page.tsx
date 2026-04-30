// Help Page
// Contains the following:

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/navbar/Navbar";
import ReactMarkdown from "react-markdown";
import { components } from "@/lib/markdown_components";

// eslint-disable-next-line max-lines-per-function
export default function HelpPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [markdownContent, setMarkdownContent] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/");
    }
  }, [session, isLoading, router]);

  useEffect(() => {
    fetch("/help.md")
      .then((res) => res.text())
      .then((text) => setMarkdownContent(text))
      .catch((err) => console.error("Failed to load help content:", err));
  }, []);

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen  ">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-sky-500/30">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Navbar />

        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-white hover:text-zinc-900 font-medium transition-colors mb-8 bg-transparent border-none p-0 cursor-pointer"
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

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-sm">
          <div className="flex flex-col text-zinc-200 leading-relaxed max-w-none">
            <ReactMarkdown components={components}>
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>
      </main>
    </div>
  );
}
