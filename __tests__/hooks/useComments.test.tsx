import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useComments } from "@/app/hooks/useComments";
import { atApiService } from "@/lib/atproto";
import { AppBskyFeedDefs } from "@atproto/api";

type GetPostThreadResponse = Awaited<
  ReturnType<typeof atApiService.agent.getPostThread>
>;

vi.mock("@/lib/atproto", () => ({
  atApiService: {
    agent: {
      getPostThread: vi.fn(),
    },
  },
}));

const mockReply: AppBskyFeedDefs.ThreadViewPost = {
  $type: "app.bsky.feed.defs#threadViewPost",
  post: {
    uri: "at://did:plc:abc/app.bsky.feed.post/reply1",
    cid: "cid-reply-1",
    author: { did: "did:plc:abc", handle: "user.bsky.social" },
    record: {},
    indexedAt: new Date().toISOString(),
    likeCount: 0,
    replyCount: 0,
    repostCount: 0,
    quoteCount: 0,
  },
} as AppBskyFeedDefs.ThreadViewPost;

const mockThreadResponse = {
  success: true,
  data: {
    thread: {
      $type: "app.bsky.feed.defs#threadViewPost",
      post: {
        uri: "at://did:plc:xyz/app.bsky.feed.post/123",
        cid: "cid-root-post",
        author: { did: "did:plc:xyz", handle: "author.bsky.social" },
        record: {},
        indexedAt: new Date().toISOString(),
      },
      replies: [mockReply],
    },
  },
  headers: {},
} as unknown as GetPostThreadResponse;

describe("useComments hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialise with loading true, empty comments and the provided postCid", () => {
    vi.mocked(atApiService.agent.getPostThread).mockResolvedValue(
      mockThreadResponse,
    );

    const { result } = renderHook(() =>
      useComments("at://did:plc:xyz/app.bsky.feed.post/123", "initial-cid"),
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.comments).toEqual([]);
    expect(result.current.resolvedCid).toBe("initial-cid");
  });

  it("should not fetch and set loading to false when no postUri is provided", async () => {
    const { result } = renderHook(() => useComments());

    await act(async () => { });

    expect(atApiService.agent.getPostThread).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.comments).toEqual([]);
    expect(result.current.resolvedCid).toBeUndefined();
  });

  it("should fetch comments and resolve CID on mount", async () => {
    vi.mocked(atApiService.agent.getPostThread).mockResolvedValue(
      mockThreadResponse,
    );

    const { result } = renderHook(() =>
      useComments("at://did:plc:xyz/app.bsky.feed.post/123"),
    );

    await act(async () => { });

    expect(atApiService.agent.getPostThread).toHaveBeenCalledWith({
      uri: "at://did:plc:xyz/app.bsky.feed.post/123",
    });
    expect(result.current.comments).toEqual([mockReply]);
    expect(result.current.resolvedCid).toBe("cid-root-post");
    expect(result.current.loading).toBe(false);
  });

  it("should overwrite the pre-provided CID with the one resolved from the thread", async () => {
    vi.mocked(atApiService.agent.getPostThread).mockResolvedValue(
      mockThreadResponse,
    );

    const { result } = renderHook(() =>
      useComments("at://did:plc:xyz/app.bsky.feed.post/123", "stale-cid"),
    );

    await act(async () => { });

    expect(result.current.resolvedCid).toBe("cid-root-post");
  });

  it("should filter out non-ThreadViewPost replies", async () => {
    const blockedPost = {
      $type: "app.bsky.feed.defs#blockedPost",
      uri: "at://did:plc:abc/app.bsky.feed.post/blocked",
      blocked: true,
      author: { did: "did:plc:abc", handle: "blocked.bsky.social" },
    };

    const responseWithMixedReplies = {
      ...mockThreadResponse,
      data: {
        thread: {
          ...mockThreadResponse.data.thread,
          replies: [mockReply, blockedPost],
        },
      },
    } as unknown as GetPostThreadResponse;

    vi.mocked(atApiService.agent.getPostThread).mockResolvedValue(
      responseWithMixedReplies,
    );

    const { result } = renderHook(() =>
      useComments("at://did:plc:xyz/app.bsky.feed.post/123"),
    );

    await act(async () => { });

    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments[0]).toEqual(mockReply);
  });

  it("should leave comments empty when thread has no replies", async () => {
    const responseWithNoReplies = {
      ...mockThreadResponse,
      data: {
        thread: {
          ...mockThreadResponse.data.thread,
          replies: undefined,
        },
      },
    } as unknown as GetPostThreadResponse;

    vi.mocked(atApiService.agent.getPostThread).mockResolvedValue(
      responseWithNoReplies,
    );

    const { result } = renderHook(() =>
      useComments("at://did:plc:xyz/app.bsky.feed.post/123"),
    );

    await act(async () => { });

    expect(result.current.comments).toEqual([]);
  });

  it("should leave comments empty when success is false", async () => {
    vi.mocked(atApiService.agent.getPostThread).mockResolvedValue({
      success: false,
      data: { thread: null },
      headers: {},
    } as unknown as GetPostThreadResponse);

    const { result } = renderHook(() =>
      useComments("at://did:plc:xyz/app.bsky.feed.post/123"),
    );

    await act(async () => { });

    expect(result.current.comments).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("should set loading to false and keep comments empty when fetch throws", async () => {
    vi.mocked(atApiService.agent.getPostThread).mockRejectedValue(
      new Error("network error"),
    );
    vi.spyOn(console, "warn").mockImplementation(() => { });

    const { result } = renderHook(() =>
      useComments("at://did:plc:xyz/app.bsky.feed.post/123"),
    );

    await act(async () => { });

    expect(result.current.loading).toBe(false);
    expect(result.current.comments).toEqual([]);
  });

  it("should warn with the error when fetch throws", async () => {
    const error = new Error("network error");
    vi.mocked(atApiService.agent.getPostThread).mockRejectedValue(error);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });

    renderHook(() => useComments("at://did:plc:xyz/app.bsky.feed.post/123"));

    await act(async () => { });

    expect(warnSpy).toHaveBeenCalledWith("Failed to fetch comments", error);
  });

  it("should refetch and update comments when fetchComments is called manually", async () => {
    const emptyResponse = {
      ...mockThreadResponse,
      data: {
        thread: { ...mockThreadResponse.data.thread, replies: [] },
      },
    } as unknown as GetPostThreadResponse;

    vi.mocked(atApiService.agent.getPostThread)
      .mockResolvedValueOnce(emptyResponse)
      .mockResolvedValueOnce(mockThreadResponse);

    const { result } = renderHook(() =>
      useComments("at://did:plc:xyz/app.bsky.feed.post/123"),
    );

    await act(async () => { });
    expect(result.current.comments).toEqual([]);

    await act(async () => {
      await result.current.fetchComments();
    });

    expect(result.current.comments).toEqual([mockReply]);
  });

  it("should re-fetch when postUri changes", async () => {
    vi.mocked(atApiService.agent.getPostThread).mockResolvedValue(
      mockThreadResponse,
    );

    const { rerender } = renderHook(
      ({ uri }: { uri: string }) => useComments(uri),
      { initialProps: { uri: "at://did:plc:xyz/app.bsky.feed.post/1" } },
    );

    await act(async () => { });
    expect(atApiService.agent.getPostThread).toHaveBeenCalledTimes(1);

    rerender({ uri: "at://did:plc:xyz/app.bsky.feed.post/2" });

    await act(async () => { });
    expect(atApiService.agent.getPostThread).toHaveBeenCalledTimes(2);
    expect(atApiService.agent.getPostThread).toHaveBeenLastCalledWith({
      uri: "at://did:plc:xyz/app.bsky.feed.post/2",
    });
  });
});
