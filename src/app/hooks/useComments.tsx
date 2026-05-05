// useComments hook
// Contains the following:
// - Fetching comments for a review
// - Resolving the CID of the post

import { useCallback, useEffect, useState } from "react";
import { atApiService } from "@/lib/atproto";
import { AppBskyFeedDefs } from "@atproto/api";

export function useComments(postUri?: string, postCid?: string) {
  // constants used to hold comments for review
  const [comments, setComments] = useState<AppBskyFeedDefs.ThreadViewPost[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [resolvedCid, setResolvedCid] = useState(postCid);

  // utilises .getPostThread() to ensure all data from post is added to CommentModal
  // ensures each post with companion post is synced
  const fetchComments = useCallback(async () => {
    if (!postUri) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await atApiService.agent.getPostThread({ uri: postUri });
      if (res.success && res.data.thread) {
        const thread = res.data.thread as AppBskyFeedDefs.ThreadViewPost;
        if (thread.post?.cid) setResolvedCid(thread.post.cid);
        if (thread.replies) {
          setComments(
            thread.replies.filter(
              AppBskyFeedDefs.isThreadViewPost,
            ) as AppBskyFeedDefs.ThreadViewPost[],
          );
        }
      }
    } catch (err) {
      console.warn("Failed to fetch comments", err);
    } finally {
      setLoading(false);
    }
  }, [postUri]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, resolvedCid, fetchComments };
}
