// useReviewInteractions test file
// Focuses on testing useReviewInteractions hook using mocked atproto and reviews
// Testing scenarios such as error handling, updating user interactions and states

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useReviewInteractions } from "@/app/hooks/useReviewInteractions";
import { atApiService } from "@/lib/atproto";

vi.mock("@/lib/atproto", () => ({
  atApiService: {
    deleteReview: vi.fn(),
    updateReview: vi.fn(),
  },
}));

describe("useReviewInteractions", () => {
  const mockRefresh = vi.fn();
  const mockReview = {
    uri: "at://did:example:123/app.attune.music.review/xyz",
    value: {
      subjectTitle: "Album",
      subjectArtist: "Artist",
      rating: 8,
      listenedAt: "2023-01-01T00:00:00.000Z",
      createdAt: "2023-01-01T00:00:00.000Z",
    },
  };
  const mockReviews = [mockReview];

  const originalConfirm = window.confirm;
  const originalAlert = window.alert;
  const originalConsoleLog = console.log;

  const editData = {
    subjectTitle: "New Title",
    subjectArtist: "New Artist",
    rating: 10,
    text: "Updated text",
    listenedAt: "2023-01-02T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn();
    window.alert = vi.fn();
    console.log = vi.fn();
  });

  afterEach(() => {
    window.confirm = originalConfirm;
    window.alert = originalAlert;
    console.log = originalConsoleLog;
  });

  it("should initialise with selectedReview as null", () => {
    const { result } = renderHook(() =>
      useReviewInteractions(mockReviews, mockRefresh),
    );
    expect(result.current.selectedReview).toBeNull();
  });

  it("should allow setting selectedReview", () => {
    const { result } = renderHook(() =>
      useReviewInteractions(mockReviews, mockRefresh),
    );
    act(() => {
      result.current.setSelectedReview(mockReview as any);
    });
    expect(result.current.selectedReview).toEqual(mockReview);
  });

  it("should do nothing if confirm is cancelled", async () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    const { result } = renderHook(() =>
      useReviewInteractions(mockReviews as any, mockRefresh),
    );

    await act(async () => {
      await result.current.handleDelete(mockReview.uri);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(atApiService.deleteReview).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("should call deleteReview and refresh if confirmed", async () => {
    vi.mocked(window.confirm).mockReturnValue(true);
    const { result } = renderHook(() =>
      useReviewInteractions(mockReviews as any, mockRefresh),
    );

    await act(async () => {
      await result.current.handleDelete(mockReview.uri);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(atApiService.deleteReview).toHaveBeenCalledWith(mockReview.uri);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("should clear selectedReview if the deleted review was currently selected", async () => {
    vi.mocked(window.confirm).mockReturnValue(true);
    const { result } = renderHook(() =>
      useReviewInteractions(mockReviews as any, mockRefresh),
    );

    act(() => {
      result.current.setSelectedReview(mockReview as any);
    });
    expect(result.current.selectedReview).toEqual(mockReview);

    await act(async () => {
      await result.current.handleDelete(mockReview.uri);
    });

    expect(result.current.selectedReview).toBeNull();
  });

  it("should handle error during deletion", async () => {
    vi.mocked(window.confirm).mockReturnValue(true);
    vi.mocked(atApiService.deleteReview).mockRejectedValueOnce(
      new Error("Auth failed"),
    );

    const { result } = renderHook(() =>
      useReviewInteractions(mockReviews as any, mockRefresh),
    );

    await act(async () => {
      await result.current.handleDelete(mockReview.uri);
    });

    expect(console.log).toHaveBeenCalledWith(
      "Failed to delete review",
      expect.any(Error),
    );
    expect(window.alert).toHaveBeenCalledWith(
      "Failed to delete review. Make sure you are logged in.",
    );
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("should do nothing if review is not found", async () => {
    const { result } = renderHook(() =>
      useReviewInteractions(mockReviews as any, mockRefresh),
    );

    await act(async () => {
      await result.current.handleEdit("invalid-uri", editData);
    });

    expect(atApiService.updateReview).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("should update review and call refresh on success", async () => {
    const { result } = renderHook(() =>
      useReviewInteractions(mockReviews as any, mockRefresh),
    );

    await act(async () => {
      await result.current.handleEdit(mockReview.uri, editData);
    });

    expect(atApiService.updateReview).toHaveBeenCalledWith(
      mockReview.uri,
      {
        subjectTitle: editData.subjectTitle,
        subjectArtist: editData.subjectArtist,
        rating: editData.rating,
        text: editData.text,
        listenedAt: editData.listenedAt,
      },
      mockReview.value.createdAt,
    );
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("should update selectedReview if the edited review was selected", async () => {
    const { result } = renderHook(() =>
      useReviewInteractions(mockReviews as any, mockRefresh),
    );

    act(() => {
      result.current.setSelectedReview(mockReview as any);
    });

    await act(async () => {
      await result.current.handleEdit(mockReview.uri, editData);
    });

    expect(result.current.selectedReview?.value.subjectTitle).toBe("New Title");
    expect(result.current.selectedReview?.value.subjectArtist).toBe(
      "New Artist",
    );
    expect(result.current.selectedReview?.value.rating).toBe(10);
    expect(result.current.selectedReview?.value.text).toBe("Updated text");
  });

  it("should handle error during edit", async () => {
    vi.mocked(atApiService.updateReview).mockRejectedValueOnce(
      new Error("Auth failed"),
    );
    const { result } = renderHook(() =>
      useReviewInteractions(mockReviews as any, mockRefresh),
    );

    await act(async () => {
      await result.current.handleEdit(mockReview.uri, editData);
    });

    expect(console.log).toHaveBeenCalledWith(
      "Failed to update review",
      expect.any(Error),
    );
    expect(window.alert).toHaveBeenCalledWith(
      "Failed to update review. Make sure you are logged in.",
    );
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
