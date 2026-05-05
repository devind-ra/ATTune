// useOtherReviews test file
// Focuses on testing useOtherReviews hook using mocked atproto, reviews and default props
// Testing scenarios such as fetching reviews and error handling

import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useOtherReviews } from "@/app/hooks/useOtherReviews";
import { atApiService } from "@/lib/atproto";

vi.mock("@/lib/atproto", () => ({
  atApiService: {
    getOtherReviews: vi.fn(),
  },
}));

const mockReviews = [
  {
    uri: "uri:1",
    author: { did: "did:1" },
    value: { createdAt: "2024-01-01T00:00:00Z" },
  },
  {
    uri: "uri:2",
    author: { did: "did:2" },
    value: {
      listenedAt: "2024-02-01T00:00:00Z",
      createdAt: "2023-01-01T00:00:00Z",
    },
  },
  {
    uri: "uri:3",
    author: { did: "did:3" },
    value: { createdAt: "invalid-date" },
  },
];

describe("useOtherReviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  const defaultProps = {
    title: "Album Title",
    artist: "Artist Name",
    currentUserDid: "did:plc:123",
  };

  it("should not fetch if prompt props are missing", async () => {
    renderHook(() =>
      useOtherReviews({ title: "", artist: "", currentUserDid: "" }),
    );
    expect(atApiService.getOtherReviews).not.toHaveBeenCalled();
  });

  it("should fetch, sort reviews and handle loading state", async () => {
    vi.mocked(atApiService.getOtherReviews).mockResolvedValueOnce(
      mockReviews as any,
    );

    const { result } = renderHook(() => useOtherReviews(defaultProps));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(atApiService.getOtherReviews).toHaveBeenCalledWith(
      "Album Title",
      "Artist Name",
      "did:plc:123",
    );

    expect(result.current.reviews[0].uri).toBe("uri:2");
    expect(result.current.reviews[1].uri).toBe("uri:1");
    expect(result.current.reviews[2].uri).toBe("uri:3");
  });

  it("should handle error during fetch", async () => {
    vi.mocked(atApiService.getOtherReviews).mockRejectedValueOnce(
      new Error("API Error"),
    );

    const { result } = renderHook(() => useOtherReviews(defaultProps));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(console.error).toHaveBeenCalledWith(
      "Failed to fetch other reviews",
      expect.any(Error),
    );
    expect(result.current.reviews).toEqual([]);
  });

  it("should re-fetch when refreshTrigger changes", async () => {
    vi.mocked(atApiService.getOtherReviews).mockResolvedValue(
      mockReviews as any,
    );

    const { rerender } = renderHook((props) => useOtherReviews(props), {
      initialProps: { ...defaultProps, refreshTrigger: 0 },
    });

    await waitFor(() => {
      expect(atApiService.getOtherReviews).toHaveBeenCalledTimes(1);
    });

    rerender({ ...defaultProps, refreshTrigger: 1 });

    await waitFor(() => {
      expect(atApiService.getOtherReviews).toHaveBeenCalledTimes(2);
    });
  });

  it("should trigger refresh when using returned refresh method", async () => {
    vi.mocked(atApiService.getOtherReviews).mockResolvedValue(
      mockReviews as any,
    );

    const { result } = renderHook(() => useOtherReviews(defaultProps));

    await waitFor(() => {
      expect(atApiService.getOtherReviews).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(atApiService.getOtherReviews).toHaveBeenCalledTimes(2);
  });
});
