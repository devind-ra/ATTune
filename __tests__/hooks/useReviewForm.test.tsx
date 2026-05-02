import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useReviewForm } from "@/app/hooks/useReviewForm";
import { atApiService } from "@/lib/atproto";
import { getArtistName, getImageUrl } from "@/lib/utils";
import { LastFMImage } from "@/lib/lastfm";
import React from "react";

interface MockAlbum {
  name: string;
  artist: { name: string };
  image: LastFMImage[];
}

const ARTIST_RADIOHEAD = "Radiohead";
const ALBUM_IN_RAINBOWS = "In Rainbows";
const MOCK_IMAGE_URL = "https://example.com/img.jpg";

vi.mock("@/lib/atproto", () => ({
  atApiService: { createReview: vi.fn() },
}));

vi.mock("@/lib/utils", () => ({
  getArtistName: vi.fn(),
  getImageUrl: vi.fn(),
}));

const clearSearchMock = vi.fn();
vi.mock("@/app/hooks/useAlbumSearch", () => ({
  useAlbumSearch: () => ({
    searchQuery: "",
    setSearchQuery: vi.fn(),
    searchResults: [],
    isSearching: false,
    clearSearch: clearSearchMock,
  }),
}));

const onReviewCreatedMock = vi.fn();
const defaultProps = { onReviewCreated: onReviewCreatedMock };

const propsWithInitialAlbum = {
  initialTitle: "OK Computer",
  initialArtist: ARTIST_RADIOHEAD,
  initialImage: "https://example.com/image.jpg",
  onReviewCreated: onReviewCreatedMock,
};

const mockAlbumData: MockAlbum = {
  name: ALBUM_IN_RAINBOWS,
  artist: { name: ARTIST_RADIOHEAD },
  image: [{ "#text": MOCK_IMAGE_URL, size: "extralarge" }],
};

describe("useReviewForm", () => {
  const eventMock = { preventDefault: vi.fn() } as unknown as React.FormEvent;
  beforeEach(() => vi.clearAllMocks());

  it("should initialise with empty fields and search step when no initial props", () => {
    const { result } = renderHook(() => useReviewForm(defaultProps));
    expect(result.current.title).toBe("");
    expect(result.current.isSearchStep).toBe(true);
  });

  it("should initialise with provided album data and skip search step", () => {
    const { result } = renderHook(() => useReviewForm(propsWithInitialAlbum));
    expect(result.current.artist).toBe(ARTIST_RADIOHEAD);
    expect(result.current.isSearchStep).toBe(false);
  });

  it("should populate album fields and leave search step", () => {
    vi.mocked(getArtistName).mockReturnValue(ARTIST_RADIOHEAD);
    vi.mocked(getImageUrl).mockReturnValueOnce(MOCK_IMAGE_URL);

    const { result } = renderHook(() => useReviewForm(defaultProps));

    act(() => {
      result.current.handleSelectAlbum(
        mockAlbumData as unknown as Parameters<
          typeof result.current.handleSelectAlbum
        >[0],
      );
    });

    expect(result.current.title).toBe(ALBUM_IN_RAINBOWS);
    expect(clearSearchMock).toHaveBeenCalled();
  });

  it("should reset fields on handleBackToSearch", () => {
    const { result } = renderHook(() => useReviewForm(defaultProps));
    act(() => {
      result.current.handleBackToSearch();
    });
    expect(result.current.isSearchStep).toBe(true);
    expect(result.current.title).toBe("");
  });

  it("should fallback to large image if extralarge is not available", () => {
    vi.mocked(getArtistName).mockReturnValue(ARTIST_RADIOHEAD);

    vi.mocked(getImageUrl).mockReturnValueOnce("https://example.com/large.jpg");

    const { result } = renderHook(() => useReviewForm(defaultProps));

    act(() => {
      result.current.handleSelectAlbum(mockAlbumData as any);
    });

    expect(result.current.albumImage).toBe("https://example.com/large.jpg");
    expect(result.current.isSearchStep).toBe(false);
    expect(clearSearchMock).toHaveBeenCalled();
  });

  it("should not go back to search or clear fields if initialTitle is provided", () => {
    const { result } = renderHook(() => useReviewForm(propsWithInitialAlbum));

    expect(result.current.isSearchStep).toBe(false);
    expect(result.current.title).toBe("OK Computer");

    act(() => {
      result.current.handleBackToSearch();
    });

    expect(result.current.isSearchStep).toBe(false);
    expect(result.current.title).toBe("OK Computer");
    expect(result.current.artist).toBe(ARTIST_RADIOHEAD);
  });

  it("should finish selection by closing search step and clearing search state", () => {
    const { result } = renderHook(() => useReviewForm(defaultProps));

    act(() => {
      result.current.handleSelectAlbum(mockAlbumData as any);
    });

    expect(result.current.isSearchStep).toBe(false);
    expect(clearSearchMock).toHaveBeenCalled();
  });

  it("should call createReview with correct arguments", async () => {
    vi.mocked(atApiService.createReview).mockResolvedValue(
      {} as Awaited<ReturnType<typeof atApiService.createReview>>,
    );
    vi.mocked(getArtistName).mockReturnValue(ARTIST_RADIOHEAD);
    vi.mocked(getImageUrl).mockReturnValue(MOCK_IMAGE_URL);

    const { result } = renderHook(() => useReviewForm(defaultProps));

    act(() => {
      result.current.handleSelectAlbum(
        mockAlbumData as unknown as Parameters<
          typeof result.current.handleSelectAlbum
        >[0],
      );
      result.current.setRating(8);
      result.current.setText("A masterpiece");
    });

    await act(async () => {
      await result.current.handleSubmit(eventMock);
    });

    expect(atApiService.createReview).toHaveBeenCalledWith(
      expect.objectContaining({
        subjectTitle: ALBUM_IN_RAINBOWS,
        subjectArtist: ARTIST_RADIOHEAD,
        rating: 8,
      }),
      true,
    );
    expect(onReviewCreatedMock).toHaveBeenCalled();
  });

  it("should set error message on known error", async () => {
    vi.mocked(atApiService.createReview).mockRejectedValue(
      new Error("Network error"),
    );

    const { result } = renderHook(() => useReviewForm(propsWithInitialAlbum));

    await act(async () => {
      await result.current.handleSubmit(eventMock);
    });

    expect(result.current.error).toBe("Network error");
  });

  it("should set fallback error message for non-Error throws", async () => {
    vi.mocked(atApiService.createReview).mockRejectedValue("string error");

    const { result } = renderHook(() => useReviewForm(propsWithInitialAlbum));

    await act(async () => {
      await result.current.handleSubmit(eventMock);
    });

    expect(result.current.error).toBe("Failed to create review");
  });

  describe("useReviewForm: State Resetting", () => {
    const eventMock = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    beforeEach(() => vi.clearAllMocks());

    it("should reset review fields after successful submission when initialTitle is present", async () => {
      vi.mocked(atApiService.createReview).mockResolvedValue({} as any);
      const { result } = renderHook(() => useReviewForm(propsWithInitialAlbum));

      act(() => {
        result.current.setRating(5);
        result.current.setText("Great album!");
        result.current.setPublishToBluesky(false);
      });

      await act(async () => {
        await result.current.handleSubmit(eventMock);
      });

      expect(result.current.rating).toBe(0);
      expect(result.current.text).toBe("");
      expect(result.current.publishToBluesky).toBe(true);
      expect(result.current.error).toBe("");
    });

    it("should reset review fields when navigating back to search", () => {
      const { result } = renderHook(() => useReviewForm(defaultProps));

      act(() => {
        result.current.setRating(10);
        result.current.setText("I love this");
      });

      act(() => {
        result.current.handleBackToSearch();
      });

      expect(result.current.rating).toBe(0);
      expect(result.current.text).toBe("");
      expect(result.current.isSearchStep).toBe(true);
    });
  });
});
