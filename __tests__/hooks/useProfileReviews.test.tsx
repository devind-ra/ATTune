import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useProfileReviews } from "@/app/hooks/useProfileReviews";
import { atApiService } from "@/lib/atproto";

vi.mock("@/lib/atproto", () => ({
  atApiService: {
    getReviews: vi.fn(),
  },
}));

describe("useProfileReviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should do nothing if DID is not provided", () => {
    renderHook(() => useProfileReviews(undefined));
    expect(atApiService.getReviews).not.toHaveBeenCalled();
  });

  it("should fetch reviews, count the current year reviews and get 2 most recent reviews", async () => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const mockReviews = [
      { uri: "1", value: { createdAt: `${currentYear}-04-01T00:00:00Z` } },
      { uri: "2", value: { listenedAt: `${currentYear}-03-01T00:00:00Z` } },
      { uri: "3", value: { createdAt: `${lastYear}-12-01T00:00:00Z` } },
      { uri: "4", value: { createdAt: `${currentYear}-02-01T00:00:00Z` } },
    ];

    vi.mocked(atApiService.getReviews).mockResolvedValueOnce(
      mockReviews as any,
    );

    const { result } = renderHook(() => useProfileReviews("did:plc:123"));

    expect(result.current.thisYearReviewCount).toBe(0);
    expect(result.current.recentReviews).toEqual([]);

    await waitFor(() => {
      expect(result.current.thisYearReviewCount).toBe(3);
    });

    expect(result.current.recentReviews.length).toBe(2);
    expect(result.current.recentReviews[0].uri).toBe("1");
    expect(result.current.recentReviews[1].uri).toBe("2");
  });

  it("should handle error during fetch", async () => {
    vi.mocked(atApiService.getReviews).mockRejectedValueOnce(
      new Error("API Error"),
    );

    renderHook(() => useProfileReviews("did:plc:123"));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching reviews:",
        expect.any(Error),
      );
    });
  });
});
