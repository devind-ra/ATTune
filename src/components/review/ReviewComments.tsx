// ReviewComments component
// Contains the following:
// - Calls useComments hook to fetch comments
// - Calls CommentItem to display comments
// - Calls CommentForm to display comment form

"use client";

import { useState } from "react";
import { atApiService } from "@/lib/atproto";
import { useComments } from "@/app/hooks/useComments";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";

// props for review comments
interface ReviewCommentsProps {
  postUri?: string;
  postCid?: string;
}

// eslint-disable-next-line max-lines-per-function
export function ReviewComments({ postUri, postCid }: ReviewCommentsProps) {
  // constants for comment retrieval and submitting for reviews
  const { comments, loading, resolvedCid, fetchComments } = useComments(
    postUri,
    postCid,
  );
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!postUri) return null;

  // handling submission of comment on review
  // error handling if submission of comment fails
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !resolvedCid) return;
    if (!atApiService.agent.session) {
      setError("You must be logged in to comment.");
      return;
    }

    setSubmitting(true);
    setError("");
    // handling creation of comment with atApiService using .createRecord() method
    try {
      await atApiService.agent.com.atproto.repo.createRecord({
        repo: atApiService.agent.session.did,
        collection: "app.bsky.feed.post",
        record: {
          $type: "app.bsky.feed.post",
          text: newComment,
          createdAt: new Date().toISOString(),
          reply: {
            root: { uri: postUri, cid: resolvedCid },
            parent: { uri: postUri, cid: resolvedCid },
          },
        },
      });
      setNewComment("");
      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  // content called to display comments and comment form
  // allows for refreshing of comments using button
  return (
    <div className="mt-8 border-t border-zinc-800 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-zinc-100">
          Comments ({comments.length})
        </h4>
        <button
          onClick={() => fetchComments()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-400 bg-zinc-800 rounded-lg md:hover:bg-zinc-700 md:hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Refresh comments"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
      {loading ? (
        <div className="text-sm text-zinc-500 mb-4">Loading comments...</div>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map((comment, i) => (
            <CommentItem key={comment.post.uri || i} comment={comment} />
          ))}
        </div>
      )}
      <CommentForm
        value={newComment}
        onChange={setNewComment}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}
