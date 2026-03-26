import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useReviewForm } from "@/app/hooks/useReviewForm";
import { atApiService } from "@/lib/atproto";
import { getArtistName, getImageUrl } from "@/lib/utils";

vi.mock("@/lib/atproto", () => ({
    atApiService: {
        createReview: vi.fn(),
    },
}));

vi.mock("@/lib/utils", () => ({
    getArtistName: vi.fn(),
    getImageUrl: vi.fn(),
}));

vi.mock("@/app/hooks/useAlbumSearch", () => ({
    useAlbumSearch: () => ({
        searchQuery: "",
        setSearchQuery: vi.fn(),
        searchResults: [],
        isSearching: false,
        clearSearch: clearSearchMock,
    }),
}));

const clearSearchMock = vi.fn();

const onReviewCreatedMock = vi.fn();

const defaultProps = {
    onReviewCreated: onReviewCreatedMock,
};

const propsWithInitialAlbum = {
    initialTitle: "OK Computer",
    initialArtist: "Radiohead",
    initialImage: "https://example.com/image.jpg",
    onReviewCreated: onReviewCreatedMock,
};

describe("useReviewForm hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("initialisation", () => {
        it("should initialise with empty fields and search step when no initial props", () => {
            const { result } = renderHook(() => useReviewForm(defaultProps));

            expect(result.current.title).toBe("");
            expect(result.current.artist).toBe("");
            expect(result.current.albumImage).toBe("");
            expect(result.current.rating).toBe(0);
            expect(result.current.text).toBe("");
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe("");
            expect(result.current.isSearchStep).toBe(true);
        });

        it("should initialise with provided album data and skip search step", () => {
            const { result } = renderHook(() =>
                useReviewForm(propsWithInitialAlbum),
            );

            expect(result.current.title).toBe("OK Computer");
            expect(result.current.artist).toBe("Radiohead");
            expect(result.current.albumImage).toBe(
                "https://example.com/image.jpg",
            );
            expect(result.current.isSearchStep).toBe(false);
        });

        it("should initialise listenedAt to today's date", () => {
            const today = new Date().toISOString().split("T")[0];
            const { result } = renderHook(() => useReviewForm(defaultProps));

            expect(result.current.listenedAt).toBe(today);
        });
    });

    describe("handleSelectAlbum", () => {
        const mockAlbum = {
            name: "In Rainbows",
            artist: { name: "Radiohead" },
            image: [{ "#text": "https://example.com/img.jpg", size: "extralarge" }],
        };

        it("should populate album fields and leave search step", () => {
            vi.mocked(getArtistName).mockReturnValue("Radiohead");
            vi.mocked(getImageUrl).mockReturnValueOnce("https://example.com/img.jpg");

            const { result } = renderHook(() => useReviewForm(defaultProps));

            act(() => {
                result.current.handleSelectAlbum(mockAlbum as any);
            });

            expect(result.current.title).toBe("In Rainbows");
            expect(result.current.artist).toBe("Radiohead");
            expect(result.current.albumImage).toBe("https://example.com/img.jpg");
            expect(result.current.isSearchStep).toBe(false);
            expect(clearSearchMock).toHaveBeenCalled();
        });

        it("should fall back to large image if extralarge is unavailable", () => {
            vi.mocked(getArtistName).mockReturnValue("Radiohead");
            vi.mocked(getImageUrl)
                .mockReturnValueOnce("")
                .mockReturnValueOnce("https://example.com/large.jpg");

            const { result } = renderHook(() => useReviewForm(defaultProps));

            act(() => {
                result.current.handleSelectAlbum(mockAlbum as any);
            });

            expect(result.current.albumImage).toBe("https://example.com/large.jpg");
        });
    });

    describe("handleBackToSearch", () => {
        it("should reset fields and return to search step", () => {
            vi.mocked(getArtistName).mockReturnValue("Radiohead");
            vi.mocked(getImageUrl).mockReturnValue("https://example.com/img.jpg");

            const { result } = renderHook(() => useReviewForm(defaultProps));

            act(() => {
                result.current.handleSelectAlbum({
                    name: "In Rainbows",
                    artist: { name: "Radiohead" },
                    image: [],
                } as any);
            });

            act(() => {
                result.current.handleBackToSearch();
            });

            expect(result.current.isSearchStep).toBe(true);
            expect(result.current.title).toBe("");
            expect(result.current.artist).toBe("");
            expect(result.current.albumImage).toBe("");
            expect(result.current.rating).toBe(0);
            expect(result.current.text).toBe("");
            expect(result.current.error).toBe("");
        });

        it("should do nothing when initialTitle is provided", () => {
            const { result } = renderHook(() =>
                useReviewForm(propsWithInitialAlbum),
            );

            act(() => {
                result.current.handleBackToSearch();
            });

            expect(result.current.isSearchStep).toBe(false);
            expect(result.current.title).toBe("OK Computer");
        });
    });

    describe("handleSubmit", () => {
        const eventMock = {
            preventDefault: vi.fn(),
        } as unknown as React.FormEvent;

        it("should call createReview with correct arguments", async () => {
            vi.mocked(atApiService.createReview).mockResolvedValueOnce(undefined as any);
            vi.mocked(getArtistName).mockReturnValue("Radiohead");
            vi.mocked(getImageUrl).mockReturnValue("https://example.com/img.jpg");

            const { result } = renderHook(() => useReviewForm(defaultProps));

            act(() => {
                result.current.handleSelectAlbum({
                    name: "In Rainbows",
                    artist: { name: "Radiohead" },
                    image: [],
                } as any);
            });

            act(() => {
                result.current.setRating(8);
                result.current.setText("A masterpiece");
            });

            await act(async () => {
                await result.current.handleSubmit(eventMock);
            });

            expect(eventMock.preventDefault).toHaveBeenCalled();
            expect(atApiService.createReview).toHaveBeenCalledWith(
                expect.objectContaining({
                    subjectTitle: "In Rainbows",
                    subjectArtist: "Radiohead",
                    rating: 8,
                    text: "A masterpiece",
                }),
            );
            expect(onReviewCreatedMock).toHaveBeenCalled();
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe("");
        });

        it("should reset review fields and go back to search after submit without initialTitle", async () => {
            vi.mocked(atApiService.createReview).mockResolvedValueOnce(undefined as any);
            vi.mocked(getArtistName).mockReturnValue("Radiohead");
            vi.mocked(getImageUrl).mockReturnValue("");

            const { result } = renderHook(() => useReviewForm(defaultProps));

            act(() => {
                result.current.handleSelectAlbum({
                    name: "In Rainbows",
                    artist: { name: "Radiohead" },
                    image: [],
                } as any);
                result.current.setRating(9);
                result.current.setText("Incredible");
            });

            await act(async () => {
                await result.current.handleSubmit(eventMock);
            });

            expect(result.current.isSearchStep).toBe(true);
            expect(result.current.title).toBe("");
            expect(result.current.rating).toBe(0);
            expect(result.current.text).toBe("");
        });

        it("should only reset review fields (not navigate) after submit with initialTitle", async () => {
            vi.mocked(atApiService.createReview).mockResolvedValueOnce(undefined as any);

            const { result } = renderHook(() =>
                useReviewForm(propsWithInitialAlbum),
            );

            act(() => {
                result.current.setRating(7);
                result.current.setText("Great album");
            });

            await act(async () => {
                await result.current.handleSubmit(eventMock);
            });

            expect(result.current.isSearchStep).toBe(false);
            expect(result.current.title).toBe("OK Computer");
            expect(result.current.rating).toBe(0);
            expect(result.current.text).toBe("");
        });

        it("should set error message on known error", async () => {
            vi.mocked(atApiService.createReview).mockRejectedValueOnce(
                new Error("Network error"),
            );

            const { result } = renderHook(() =>
                useReviewForm(propsWithInitialAlbum),
            );

            await act(async () => {
                await result.current.handleSubmit(eventMock);
            });

            expect(result.current.error).toBe("Network error");
            expect(result.current.loading).toBe(false);
        });

        it("should set fallback error message when a non-Error value is thrown", async () => {
            vi.mocked(atApiService.createReview).mockRejectedValueOnce(
                "something went wrong",
            );

            const { result } = renderHook(() =>
                useReviewForm(propsWithInitialAlbum),
            );

            await act(async () => {
                await result.current.handleSubmit(eventMock);
            });

            expect(result.current.error).toBe("Failed to create review");
            expect(result.current.loading).toBe(false);
        });
    });
});