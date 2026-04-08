// ReviewComments component
// Contains the following:
// - Displaying comments for a review
// - Posting comments for a review

"use client";

import { useEffect, useState } from "react";
import { atApiService } from "@/lib/atproto";
import { AppBskyFeedDefs, AppBskyFeedPost } from "@atproto/api";
import Image from "next/image";

interface ReviewCommentsProps {
  postUri?: string;
  postCid?: string;
}

export function ReviewComments({ postUri, postCid }: ReviewCommentsProps) {
  const [comments, setComments] = useState<AppBskyFeedDefs.ThreadViewPost[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resolvedCid, setResolvedCid] = useState(postCid);

  const fetchComments = async () => {
    if (!postUri) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await atApiService.agent.getPostThread({ uri: postUri });
      if (res.success && res.data.thread) {
        const thread = res.data.thread as AppBskyFeedDefs.ThreadViewPost;

        if (thread.post?.cid) {
          setResolvedCid(thread.post.cid);
        }

        if (thread.replies) {
          const validReplies = thread.replies.filter((r) =>
            AppBskyFeedDefs.isThreadViewPost(r),
          ) as AppBskyFeedDefs.ThreadViewPost[];
          setComments(validReplies);
        }
      }
    } catch (err: unknown) {
      console.warn("Failed to fetch comments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postUri]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !postUri || !resolvedCid) return;
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!postUri) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
      <h4 className="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-100">
        Comments ({comments.length})
      </h4>

      {loading ? (
        <div className="text-sm text-zinc-500 mb-4">Loading comments...</div>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map((comment, i) => {
            const post = comment.post;
            const record = post.record as AppBskyFeedPost.Record;
            return (
              <div
                key={post.uri || i}
                className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  {post.author.avatar && (
                    <Image
                      src={post.author.avatar}
                      alt="avatar"
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    {post.author.displayName || post.author.handle}
                  </span>
                  <span className="text-xs text-zinc-500">
                    @{post.author.handle}
                  </span>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {record.text}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
          disabled={submitting}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>
    </div>
  );
}
