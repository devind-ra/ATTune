import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useReviews } from "@/app/hooks/useReviews";
import { atApiService } from "@/lib/atproto";

vi.mock("@/lib/atproto", () => ({
  atApiService: {
    getReviews: vi.fn(),
  },
}));

const mockReviews = [
  {
    uri: "1",
    value: {
      subjectTitle: "Album A",
      subjectArtist: "Artist 1",
      createdAt: "2024-01-01T00:00:00Z",
    },
  },
  {
    uri: "2",
    value: {
      subjectTitle: "Album B",
      subjectArtist: "Artist 2",
      listenedAt: "2024-02-01T00:00:00Z",
    },
  },
  {
    uri: "3",
    value: {
      subjectTitle: "Album C",
      subjectArtist: "Artist 1",
      createdAt: "2024-03-01T00:00:00Z",
    },
  },
];

describe("useReviews hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  const defaultProps = {
    did: "did:plc:123",
    refreshTrigger: 0,
  };

  it("should fetch, filter and sort reviews", async () => {
    vi.mocked(atApiService.getReviews).mockResolvedValueOnce(
      mockReviews as any,
    );

    const { result } = renderHook(() => useReviews(defaultProps));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(atApiService.getReviews).toHaveBeenCalledWith("did:plc:123");

    expect(result.current.reviews.map((r) => r.uri)).toEqual(["3", "2", "1"]);
  });

  it("should filter by title case-insensitively", async () => {
    vi.mocked(atApiService.getReviews).mockResolvedValueOnce(
      mockReviews as any,
    );

    const { result } = renderHook(() =>
      useReviews({ ...defaultProps, filterTitle: "album b" }),
    );

    await waitFor(() => {
      expect(result.current.reviews.map((r) => r.uri)).toEqual(["2"]);
    });
  });

  it("should filter by artist case-insensitively", async () => {
    vi.mocked(atApiService.getReviews).mockResolvedValueOnce(
      mockReviews as any,
    );

    const { result } = renderHook(() =>
      useReviews({ ...defaultProps, filterArtist: "artist 1" }),
    );

    await waitFor(() => {
      expect(result.current.reviews.map((r) => r.uri)).toEqual(["3", "1"]);
    });
  });

  it("should handle error during fetch gracefully", async () => {
    vi.mocked(atApiService.getReviews).mockRejectedValueOnce(
      new Error("API Error"),
    );

    const { result } = renderHook(() => useReviews(defaultProps));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(console.error).toHaveBeenCalledWith(
      "Failed to fetch reviews:",
      expect.any(Error),
    );
    expect(result.current.reviews).toEqual([]);
  });

  it("should trigger refresh when refreshTrigger changes", async () => {
    vi.mocked(atApiService.getReviews).mockResolvedValue(mockReviews as any);

    const { rerender } = renderHook((props) => useReviews(props), {
      initialProps: defaultProps,
    });

    await waitFor(() => {
      expect(atApiService.getReviews).toHaveBeenCalledTimes(1);
    });

    rerender({ ...defaultProps, refreshTrigger: 1 });

    await waitFor(() => {
      expect(atApiService.getReviews).toHaveBeenCalledTimes(2);
    });
  });
});
