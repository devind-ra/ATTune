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

interface ReviewCommentsProps {
  postUri?: string;
  postCid?: string;
}

// eslint-disable-next-line max-lines-per-function
export function ReviewComments({ postUri, postCid }: ReviewCommentsProps) {
  const { comments, loading, resolvedCid, fetchComments } = useComments(
    postUri,
    postCid,
  );
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!postUri) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !resolvedCid) return;
    if (!atApiService.agent.session) {
      setError("You must be logged in to comment.");
      return;
    }

    setSubmitting(true);
    setError("");
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

  return (
    <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
      <h4 className="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-100">
        Comments ({comments.length})
      </h4>
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
