// useOtherProfilePage test file
// Focuses on testing useOtherProfilePage hook using mocked atproto, AuthContext, useProfileReviews and useProfile tastes files
// Testing scenarios such as handling states and data processing

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useOtherProfilePage } from "@/app/hooks/useOtherProfilePage";
import { useAuth } from "@/contexts/AuthContext";
import { atApiService } from "@/lib/atproto";
import { useProfileReviews } from "@/app/hooks/useProfileReviews";
import { useProfileTastes } from "@/app/hooks/useProfileTastes";

vi.mock("@/contexts/AuthContext");
vi.mock("@/lib/atproto", () => ({
  atApiService: {
    agent: { getProfile: vi.fn() },
    followUser: vi.fn(),
    unfollowUser: vi.fn(),
  },
}));
vi.mock("@/app/hooks/useProfileReviews");
vi.mock("@/app/hooks/useProfileTastes");

const mockUseAuth = vi.mocked(useAuth);
const mockGetProfile = vi.mocked(atApiService.agent.getProfile);
const mockFollowUser = vi.mocked(atApiService.followUser);
const mockUnfollowUser = vi.mocked(atApiService.unfollowUser);
const mockUseProfileReviews = vi.mocked(useProfileReviews);
const mockUseProfileTastes = vi.mocked(useProfileTastes);

const mockSession = { did: "did:plc:viewer", handle: "viewer.bsky.social" };

const mockProfile = {
  did: "did:plc:alice",
  handle: "alice.bsky.social",
  displayName: "Alice",
  viewer: { following: undefined, followedBy: undefined },
  followsCount: 10,
  followersCount: 100,
  postsCount: 50,
  indexedAt: "2024-01-01T00:00:00Z",
};

const mockProfileFollowing = {
  ...mockProfile,
  viewer: {
    following: "at://did:plc:viewer/app.bsky.graph.follow/abc123",
    followedBy: undefined,
  },
};

const mockReviewsReturn = {
  thisYearReviewCount: 5,
  recentReviews: [{ uri: "at://review/1" }],
  allReviews: [{ uri: "at://review/1" }, { uri: "at://review/2" }],
  refresh: vi.fn(),
};

const mockTastesReturn = {
  tastes: [{ artist: "Radiohead", score: 9 }],
};

beforeEach(() => {
  vi.clearAllMocks();

  mockUseAuth.mockReturnValue({
    session: mockSession,
    isLoading: false,
  } as any);

  mockGetProfile.mockResolvedValue({ data: mockProfile } as any);
  mockFollowUser.mockResolvedValue({
    uri: "at://did:plc:viewer/app.bsky.graph.follow/newfollow123",
  } as any);
  mockUnfollowUser.mockResolvedValue(undefined as any);

  mockUseProfileReviews.mockReturnValue(mockReviewsReturn as any);
  mockUseProfileTastes.mockReturnValue(mockTastesReturn as any);
});

describe("useOtherProfilePage", () => {
  const createControllablePromise = () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    return { promise, resolve: () => resolvePromise({ data: mockProfile }) };
  };

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("should return isLoadingProfile=true before fetch resolves", async () => {
    const { promise, resolve } = createControllablePromise();
    mockGetProfile.mockReturnValue(promise as any);

    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );

    expect(result.current.isLoadingProfile).toBe(true);

    resolve();
    await act(() => promise);
    unmount();
  });

  it("should return profile=null before fetch resolves", async () => {
    const { promise, resolve } = createControllablePromise();
    mockGetProfile.mockReturnValue(promise as any);

    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );

    expect(result.current.profile).toBeNull();

    resolve();
    await act(() => promise);
    unmount();
  });

  it("should return isFollowingLoading=false initially", async () => {
    const { promise, resolve } = createControllablePromise();
    mockGetProfile.mockReturnValue(promise as any);

    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );

    expect(result.current.isFollowingLoading).toBe(false);

    resolve();
    await act(() => promise);
    unmount();
  });

  it("should set profile after successful fetch", async () => {
    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );

    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    expect(result.current.profile).toEqual(mockProfile);

    unmount();
  });

  it("should set isLoadingProfile to false after fetch resolves", async () => {
    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );

    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    unmount();
  });

  it("should call getProfile with the decoded handle", async () => {
    const { unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );

    await waitFor(() =>
      expect(mockGetProfile).toHaveBeenCalledWith({
        actor: "alice.bsky.social",
      }),
    );

    unmount();
  });

  it("should decode URI-encoded handles before fetching", async () => {
    const { unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social%2Ftest"),
    );

    await waitFor(() =>
      expect(mockGetProfile).toHaveBeenCalledWith({
        actor: "alice.bsky.social/test",
      }),
    );

    unmount();
  });

  it("should log an error and sets isLoadingProfile to false when fetch fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });
    const error = new Error("Network error");
    mockGetProfile.mockRejectedValue(error);

    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );

    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching other profile:",
      error,
    );

    consoleSpy.mockRestore();
    unmount();
  });

  it("should leave profile as null when fetch fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => { });
    mockGetProfile.mockRejectedValue(new Error("Network error"));

    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );

    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));
    expect(result.current.profile).toBeNull();

    unmount();
  });

  it("should re-fetch when handle changes", async () => {
    const { rerender, unmount } = renderHook(
      ({ handle }) => useOtherProfilePage(handle),
      { initialProps: { handle: "alice.bsky.social" } },
    );

    await waitFor(() => expect(mockGetProfile).toHaveBeenCalledTimes(1));

    rerender({ handle: "bob.bsky.social" });

    await waitFor(() => expect(mockGetProfile).toHaveBeenCalledTimes(2));
    expect(mockGetProfile).toHaveBeenLastCalledWith({
      actor: "bob.bsky.social",
    });

    unmount();
  });

  it("should returns session from useAuth", async () => {
    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );

    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    expect(result.current.session).toBe(mockSession);

    unmount();
  });

  it("should return authLoading from useAuth", async () => {
    mockUseAuth.mockReturnValue({ session: null, isLoading: true } as any);

    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );

    expect(result.current.authLoading).toBe(true);

    unmount();
  });

  it("should return review data from useProfileReviews", async () => {
    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );

    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    expect(result.current.thisYearReviewCount).toBe(5);
    expect(result.current.recentReviews).toEqual(
      mockReviewsReturn.recentReviews,
    );
    expect(result.current.allReviews).toEqual(mockReviewsReturn.allReviews);
    expect(result.current.refreshReviews).toBe(mockReviewsReturn.refresh);

    unmount();
  });

  it("should call useProfileReviews with undefined did before profile loads", async () => {
    const { unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );

    expect(mockUseProfileReviews).toHaveBeenCalledWith(undefined);

    unmount();
  });

  it("should calls useProfileReviews with profile did after profile loads", async () => {
    const { unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );

    await waitFor(() =>
      expect(mockUseProfileReviews).toHaveBeenCalledWith("did:plc:alice"),
    );

    unmount();
  });

  it("should return tastes from useProfileTastes", async () => {
    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );

    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    expect(result.current.tastes).toEqual(mockTastesReturn.tastes);

    unmount();
  });

  it("should call followUser when not currently following", async () => {
    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );
    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    await act(async () => {
      await result.current.toggleFollow();
    });

    expect(mockFollowUser).toHaveBeenCalledWith("did:plc:alice");
    expect(mockUnfollowUser).not.toHaveBeenCalled();

    unmount();
  });

  it("should call unfollowUser with the follow URI when already following", async () => {
    mockGetProfile.mockResolvedValue({ data: mockProfileFollowing } as any);

    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );
    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    await act(async () => {
      await result.current.toggleFollow();
    });

    expect(mockUnfollowUser).toHaveBeenCalledWith(
      "at://did:plc:viewer/app.bsky.graph.follow/abc123",
    );
    expect(mockFollowUser).not.toHaveBeenCalled();

    unmount();
  });

  it("should update profile state optimistically after toggling follow", async () => {
    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );
    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    expect(result.current.profile?.viewer?.following).toBeUndefined();
    expect(result.current.profile?.followersCount).toBe(100);

    await act(async () => {
      await result.current.toggleFollow();
    });

    expect(result.current.profile?.viewer?.following).toBe(
      "at://did:plc:viewer/app.bsky.graph.follow/newfollow123",
    );
    expect(result.current.profile?.followersCount).toBe(101);

    unmount();
  });

  it("should re-fetch the profile after toggling follow after delay", async () => {
    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );
    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    vi.useFakeTimers();
    const callsBefore = mockGetProfile.mock.calls.length;

    await act(async () => {
      await result.current.toggleFollow();
    });

    expect(mockGetProfile.mock.calls.length).toBe(callsBefore);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    vi.useRealTimers();
    await waitFor(() =>
      expect(mockGetProfile.mock.calls.length).toBeGreaterThan(callsBefore),
    );

    unmount();
  });

  it("should preserve optimistic state if background fetch is stale", async () => {
    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );
    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    vi.useFakeTimers();
    await act(async () => {
      await result.current.toggleFollow();
    });

    expect(result.current.profile?.viewer?.following).toBeDefined();

    mockGetProfile.mockResolvedValueOnce({ data: mockProfile } as any);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    vi.useRealTimers();
    await waitFor(() =>
      expect(mockGetProfile.mock.calls.length).toBeGreaterThan(1),
    );

    expect(result.current.profile?.viewer?.following).toBeDefined();
    expect(result.current.profile?.followersCount).toBe(101);

    unmount();
  });

  it("should update profile state normally if background fetch is consistent", async () => {
    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );
    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    vi.useFakeTimers();
    await act(async () => {
      await result.current.toggleFollow();
    });

    const updatedProfile = {
      ...mockProfile,
      viewer: {
        following: "at://did:plc:viewer/app.bsky.graph.follow/newfollow123",
      },
      followersCount: 101,
      description: "New Bio",
    };
    mockGetProfile.mockResolvedValueOnce({ data: updatedProfile } as any);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    vi.useRealTimers();
    await waitFor(() =>
      expect(result.current.profile?.description).toBe("New Bio"),
    );

    expect(result.current.profile?.viewer?.following).toBe(
      "at://did:plc:viewer/app.bsky.graph.follow/newfollow123",
    );
    unmount();
  });

  it("should log a sync error if background fetch fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });
    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );
    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    vi.useFakeTimers();
    await act(async () => {
      await result.current.toggleFollow();
    });

    const error = new Error("Sync failed");
    mockGetProfile.mockRejectedValueOnce(error);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    vi.useRealTimers();
    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith("Sync Error:", error),
    );

    consoleSpy.mockRestore();
    unmount();
  });

  it("should set isFollowingLoading to false after toggle resolves", async () => {
    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );
    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    await act(async () => {
      await result.current.toggleFollow();
    });

    expect(result.current.isFollowingLoading).toBe(false);

    unmount();
  });

  it("should set isFollowingLoading to false when toggle throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => { });
    mockFollowUser.mockRejectedValue(new Error("Follow failed"));

    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );
    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    await act(async () => {
      await result.current.toggleFollow();
    });

    expect(result.current.isFollowingLoading).toBe(false);

    unmount();
  });

  it("should log an error when toggle throws", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });
    const error = new Error("Follow failed");
    mockFollowUser.mockRejectedValue(error);

    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );
    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    await act(async () => {
      await result.current.toggleFollow();
    });

    expect(consoleSpy).toHaveBeenCalledWith("Error toggling follow:", error);

    consoleSpy.mockRestore();
    unmount();
  });

  it("should do nothing when profile is null", async () => {
    vi.spyOn(console, "error").mockImplementation(() => { });
    mockGetProfile.mockRejectedValue(new Error("Not found"));

    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );
    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    await act(async () => {
      await result.current.toggleFollow();
    });

    expect(mockFollowUser).not.toHaveBeenCalled();
    expect(mockUnfollowUser).not.toHaveBeenCalled();

    unmount();
  });

  it("should do nothing when session is null", async () => {
    mockUseAuth.mockReturnValue({ session: null, isLoading: false } as any);

    const { result, unmount } = renderHook(() =>
      useOtherProfilePage("alice.bsky.social"),
    );
    await waitFor(() => expect(result.current.isLoadingProfile).toBe(false));

    await act(async () => {
      await result.current.toggleFollow();
    });

    expect(mockFollowUser).not.toHaveBeenCalled();
    expect(mockUnfollowUser).not.toHaveBeenCalled();

    unmount();
  });
});
