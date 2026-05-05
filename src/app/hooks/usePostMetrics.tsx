// usePostMetrics Hook
// Contains the following:
// - Fetches like count and viewer like status for a post
// - Has toggle and untoggle like functions

import { useState, useEffect } from "react";
import { atApiService } from "@/lib/atproto";

export function usePostMetrics(postUri?: string, postCid?: string) {
  // constants used to hold the like data for reviews
  const [likeCount, setLikeCount] = useState(0);
  const [viewerLikeUri, setViewerLikeUri] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    // function used to retrieve post metrics using atproto file for like count
    async function fetchMetrics() {
      if (!postUri) return;
      try {
        const metrics = await atApiService.getPostMetrics(postUri);
        if (mounted) {
          setLikeCount(metrics.likeCount);
          setViewerLikeUri(metrics.viewerLike);
        }
      } catch (err) {
        console.warn("Failed to fetch metrics", err);
      }
    }

    fetchMetrics();

    return () => {
      mounted = false;
    };
  }, [postUri]);

  // used to allow to like or unlike a post using the UI
  const toggleLike = async () => {
    if (!postUri || !postCid || !atApiService.agent.session) return;

    setLoading(true);
    setError("");

    try {
      if (viewerLikeUri) {
        await atApiService.unlikePost(viewerLikeUri);
        setViewerLikeUri(undefined);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        const res = await atApiService.likePost(postUri, postCid);
        setViewerLikeUri(res.data.uri);
        setLikeCount((prev) => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle like");
    } finally {
      setLoading(false);
    }
  };

  return { likeCount, hasLiked: !!viewerLikeUri, toggleLike, loading, error };
}
