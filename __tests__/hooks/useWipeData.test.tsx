import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useWipeData } from "@/app/hooks/useWipeData";
import { useAuth } from "@/contexts/AuthContext";
import { atApiService } from "@/lib/atproto";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/atproto", () => ({
  atApiService: {
    login: vi.fn(),
    getReviews: vi.fn(),
    deleteReview: vi.fn(),
    deleteTastes: vi.fn(),
  },
}));

describe("useWipeData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialise with default empty states", () => {
    vi.mocked(useAuth).mockReturnValue({
      session: { handle: "test.bsky.social", did: "did:test:123" },
    } as any);
    const { result } = renderHook(() => useWipeData());

    expect(result.current.password).toBe("");
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.deleteError).toBe("");
  });

  it("should successfully wipe data and call onSuccess", async () => {
    vi.mocked(useAuth).mockReturnValue({
      session: { handle: "test.bsky.social", did: "did:test:123" },
    } as any);
    vi.mocked(atApiService.getReviews).mockResolvedValue([
      { uri: "at://record1" },
      { uri: "at://record2" },
    ] as any);

    const { result } = renderHook(() => useWipeData());

    act(() => {
      result.current.setPassword("mypassword");
    });

    const onSuccess = vi.fn();

    await act(async () => {
      await result.current.handleWipeData(onSuccess);
    });

    expect(atApiService.login).toHaveBeenCalledWith(
      "test.bsky.social",
      "mypassword",
    );
    expect(atApiService.getReviews).toHaveBeenCalledWith("did:test:123");
    expect(atApiService.deleteReview).toHaveBeenCalledTimes(2);
    expect(atApiService.deleteReview).toHaveBeenCalledWith("at://record1");
    expect(atApiService.deleteReview).toHaveBeenCalledWith("at://record2");
    expect(atApiService.deleteTastes).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.deleteError).toBe("");
  });

  it("should handle missing session by returning early", async () => {
    vi.mocked(useAuth).mockReturnValue({ session: null } as any);
    const { result } = renderHook(() => useWipeData());

    const onSuccess = vi.fn();
    await act(async () => {
      await result.current.handleWipeData(onSuccess);
    });

    expect(atApiService.login).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("should set error state if login or wiping fails", async () => {
    vi.mocked(useAuth).mockReturnValue({
      session: { handle: "test.bsky.social", did: "did:test:123" },
    } as any);
    vi.mocked(atApiService.login).mockRejectedValueOnce(
      new Error("Auth failed"),
    );

    const { result } = renderHook(() => useWipeData());

    const onSuccess = vi.fn();
    await act(async () => {
      await result.current.handleWipeData(onSuccess);
    });

    expect(result.current.deleteError).toBe(
      "Invalid password or failed to delete data.",
    );
    expect(result.current.isDeleting).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
