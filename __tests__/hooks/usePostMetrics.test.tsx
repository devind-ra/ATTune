import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePostMetrics } from "@/app/hooks/usePostMetrics";
import { atApiService } from "@/lib/atproto";

vi.mock("@/lib/atproto", () => ({
  atApiService: {
    agent: {
      session: {
        did: "did:plc:123",
      },
    },
    getPostMetrics: vi.fn(),
    likePost: vi.fn(),
    unlikePost: vi.fn(),
  },
}));

describe("usePostMetrics hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("should have correct initial state when no postUri is provided", () => {
    const { result } = renderHook(() => usePostMetrics());

    expect(result.current.likeCount).toBe(0);
    expect(result.current.hasLiked).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");

    expect(atApiService.getPostMetrics).not.toHaveBeenCalled();
  });

  it("should fetch metrics on mount with a postUri", async () => {
    vi.mocked(atApiService.getPostMetrics).mockResolvedValueOnce({
      likeCount: 42,
      viewerLike: "at://user/like/123",
    });

    const { result } = renderHook(() =>
      usePostMetrics("at://post/123", "cid-123"),
    );

    await waitFor(() => {
      expect(result.current.likeCount).toBe(42);
    });

    expect(result.current.hasLiked).toBe(true);
    expect(atApiService.getPostMetrics).toHaveBeenCalledWith("at://post/123");
  });

  it("should handle error when fetching metrics gracefully", async () => {
    vi.mocked(atApiService.getPostMetrics).mockRejectedValueOnce(
      new Error("Network error"),
    );

    const { result } = renderHook(() =>
      usePostMetrics("at://post/123", "cid-123"),
    );

    await waitFor(() => {
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to fetch metrics",
        expect.any(Error),
      );
    });

    expect(result.current.likeCount).toBe(0);
    expect(result.current.hasLiked).toBe(false);
  });

  it("should like a post when toggleLike is called and user hasn't liked it yet", async () => {
    vi.mocked(atApiService.getPostMetrics).mockResolvedValueOnce({
      likeCount: 5,
      viewerLike: undefined,
    });

    vi.mocked(atApiService.likePost).mockResolvedValueOnce({
      data: {
        uri: "at://user/like/abc",
        cid: "cid-abc",
      },
    } as any);

    const { result } = renderHook(() =>
      usePostMetrics("at://post/123", "cid-123"),
    );

    await waitFor(() => {
      expect(result.current.likeCount).toBe(5);
    });

    await act(async () => {
      await result.current.toggleLike();
    });

    expect(atApiService.likePost).toHaveBeenCalledWith(
      "at://post/123",
      "cid-123",
    );
    expect(result.current.likeCount).toBe(6);
    expect(result.current.hasLiked).toBe(true);
    expect(result.current.error).toBe("");
  });

  it("should unlike a post when toggleLike is called and user already liked it", async () => {
    vi.mocked(atApiService.getPostMetrics).mockResolvedValueOnce({
      likeCount: 5,
      viewerLike: "at://user/like/abc",
    });

    vi.mocked(atApiService.unlikePost).mockResolvedValueOnce(undefined as any);

    const { result } = renderHook(() =>
      usePostMetrics("at://post/123", "cid-123"),
    );

    await waitFor(() => {
      expect(result.current.likeCount).toBe(5);
    });

    await act(async () => {
      await result.current.toggleLike();
    });

    expect(atApiService.unlikePost).toHaveBeenCalledWith("at://user/like/abc");
    expect(result.current.likeCount).toBe(4);
    expect(result.current.hasLiked).toBe(false);
  });

  it("should not drop below 0 when unliking from 0 somehow", async () => {
    vi.mocked(atApiService.getPostMetrics).mockResolvedValueOnce({
      likeCount: 0,
      viewerLike: "at://user/like/abc",
    });

    vi.mocked(atApiService.unlikePost).mockResolvedValueOnce(undefined as any);

    const { result } = renderHook(() =>
      usePostMetrics("at://post/123", "cid-123"),
    );

    await waitFor(() => {
      expect(result.current.likeCount).toBe(0);
    });

    await act(async () => {
      await result.current.toggleLike();
    });

    expect(result.current.likeCount).toBe(0);
  });

  it("should handle error when toggleLike fails", async () => {
    vi.mocked(atApiService.getPostMetrics).mockResolvedValueOnce({
      likeCount: 5,
      viewerLike: undefined,
    });

    vi.mocked(atApiService.likePost).mockRejectedValueOnce(
      new Error("Like failed"),
    );

    const { result } = renderHook(() =>
      usePostMetrics("at://post/123", "cid-123"),
    );

    await waitFor(() => {
      expect(result.current.likeCount).toBe(5);
    });

    await act(async () => {
      await result.current.toggleLike();
    });

    expect(result.current.error).toBe("Like failed");
    expect(result.current.likeCount).toBe(5);
    expect(result.current.hasLiked).toBe(false);
  });
});
