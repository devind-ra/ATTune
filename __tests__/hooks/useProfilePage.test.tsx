// useProfilePage test file
// Focuses on testing useProfilePage hook using mocked atproto, AuthContext and next navigation
// Testing scenarios such as handling states, redirects and fetching data

import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useProfilePage } from "@/app/hooks/useProfilePage";
import { atApiService } from "@/lib/atproto";

interface UserSession {
  did: string;
  handle: string;
}

interface AuthContextType {
  session: UserSession | null;
  isLoading: boolean;
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
}));

const routerPushMock = vi.fn();

const sessionMock = {
  did: "did:plc:123",
  handle: "testuser.bsky.social",
};

const contextMock: AuthContextType = {
  session: sessionMock,
  isLoading: false,
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => contextMock,
}));

vi.mock("@/lib/atproto", () => ({
  atApiService: {
    agent: {
      getProfile: vi.fn(),
    },
    getTastes: vi.fn(),
    updateTastes: vi.fn(),
  },
}));

const reviewsMock = {
  thisYearReviewCount: 12,
  recentReviews: [{ uri: "at://review/1", rating: 8 }],
};

vi.mock("@/app/hooks/useProfileReviews", () => ({
  useProfileReviews: () => reviewsMock,
}));

const tastesMock = {
  tastes: null,
  isEditingTastes: false,
  setIsEditingTastes: vi.fn(),
  editArtists: Array(5).fill(""),
  editGenres: Array(3).fill(""),
  handleArtistChange: vi.fn(),
  handleGenreChange: vi.fn(),
  artistExcludeValues: [],
  genreExcludeValues: [],
  isSavingTastes: false,
  handleSaveTastes: vi.fn(),
  cancelEditTastes: vi.fn(),
};

vi.mock("@/app/hooks/useProfileTastes", () => ({
  useProfileTastes: () => tastesMock,
}));

const profileMock = {
  did: "did:plc:123",
  handle: "testuser.bsky.social",
  displayName: "Test User",
};

type ProfileResponse = Awaited<
  ReturnType<typeof atApiService.agent.getProfile>
>;

describe("useProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => { });
    contextMock.session = sessionMock;
    contextMock.isLoading = false;

    vi.mocked(atApiService.agent.getProfile).mockResolvedValueOnce({
      data: profileMock,
    } as ProfileResponse);
  });

  it("should redirect to root when not loading and no session", async () => {
    contextMock.session = null;
    contextMock.isLoading = false;

    renderHook(() => useProfilePage());

    await waitFor(() => {
      expect(routerPushMock).toHaveBeenCalledWith("/");
    });
  });

  it("should not redirect when session exists", async () => {
    vi.mocked(atApiService.agent.getProfile).mockResolvedValueOnce({
      data: profileMock,
    } as ProfileResponse);

    renderHook(() => useProfilePage());

    await waitFor(() => {
      expect(atApiService.agent.getProfile).toHaveBeenCalled();
    });

    expect(routerPushMock).not.toHaveBeenCalled();
  });

  it("should not redirect while still loading", () => {
    contextMock.session = null;
    contextMock.isLoading = true;

    renderHook(() => useProfilePage());

    expect(routerPushMock).not.toHaveBeenCalled();
  });

  it("should fetch and return profile when session exists", async () => {
    vi.mocked(atApiService.agent.getProfile).mockResolvedValueOnce({
      data: profileMock,
    } as ProfileResponse);

    const { result } = renderHook(() => useProfilePage());

    await waitFor(() => {
      expect(result.current.profile).toEqual(profileMock);
    });

    expect(atApiService.agent.getProfile).toHaveBeenCalledWith({
      actor: sessionMock.did,
    });
  });

  it("should not fetch profile when session is null", () => {
    contextMock.session = null;

    renderHook(() => useProfilePage());

    expect(atApiService.agent.getProfile).not.toHaveBeenCalled();
  });

  it("should log an error when getProfile rejects", async () => {
    vi.mocked(atApiService.agent.getProfile).mockReset();
    vi.mocked(atApiService.agent.getProfile).mockRejectedValueOnce(
      new Error("Network error"),
    );

    renderHook(() => useProfilePage());

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching profile:",
        expect.any(Error),
      );
    });
  });

  it("should spread tastesData into the return value", async () => {
    vi.mocked(atApiService.agent.getProfile).mockResolvedValueOnce({
      data: profileMock,
    } as ProfileResponse);

    const { result } = renderHook(() => useProfilePage());

    expect(result.current.isEditingTastes).toBe(false);
    expect(result.current.editArtists).toEqual(Array(5).fill(""));
    expect(result.current.editGenres).toEqual(Array(3).fill(""));
    expect(result.current.handleSaveTastes).toBe(tastesMock.handleSaveTastes);
    expect(result.current.cancelEditTastes).toBe(tastesMock.cancelEditTastes);
  });

  it("should return session and isLoading from auth context", () => {
    const { result } = renderHook(() => useProfilePage());

    expect(result.current.session).toEqual(sessionMock);
    expect(result.current.isLoading).toBe(false);
  });

  it("should return review data from useProfileReviews", () => {
    const { result } = renderHook(() => useProfilePage());

    expect(result.current.thisYearReviewCount).toBe(12);
    expect(result.current.recentReviews).toEqual(reviewsMock.recentReviews);
  });
});
