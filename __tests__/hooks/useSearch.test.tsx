import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSearch } from "@/app/hooks/useSearch";
import { searchArtist, searchAlbum } from "@/lib/lastfm";

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: routerPushMock }),
}));

const routerPushMock = vi.fn();

const contextMock = {
    session: { did: "did:plc:123", handle: "testuser.bsky.social" } as any,
    isLoading: false,
};

vi.mock("@/contexts/AuthContext", () => ({
    useAuth: () => contextMock,
}));

vi.mock("@/lib/lastfm", () => ({
    searchArtist: vi.fn(),
    searchAlbum: vi.fn(),
}));

const mockArtists = [
    { name: "Radiohead", listeners: "3000000" },
    { name: "Radiohead tribute", listeners: "50000" },
];

const mockAlbums = [
    { name: "OK Computer", artist: { name: "Radiohead" }, image: [] },
    { name: "The Bends", artist: { name: "Radiohead" }, image: [] },
];

describe("useSearch hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => { });
        contextMock.session = { did: "did:plc:123", handle: "testuser.bsky.social" } as any;
        contextMock.isLoading = false;
    });

    describe("auth redirect", () => {
        it("should redirect to / when not loading and no session", async () => {
            contextMock.session = null as any;
            contextMock.isLoading = false;

            renderHook(() => useSearch(null));

            await waitFor(() => {
                expect(routerPushMock).toHaveBeenCalledWith("/");
            });
        });

        it("should not redirect when session exists", () => {
            renderHook(() => useSearch(null));

            expect(routerPushMock).not.toHaveBeenCalled();
        });

        it("should not redirect while still loading", () => {
            contextMock.session = null as any;
            contextMock.isLoading = true;

            renderHook(() => useSearch(null));

            expect(routerPushMock).not.toHaveBeenCalled();
        });
    });

    describe("initialisation", () => {
        it("should initialise with empty results and default state", () => {
            const { result } = renderHook(() => useSearch(null));

            expect(result.current.artists).toEqual([]);
            expect(result.current.albums).toEqual([]);
            expect(result.current.primaryResultType).toBe("artist");
            expect(result.current.isSearching).toBe(false);
        });

        it("should not search when query is null", () => {
            renderHook(() => useSearch(null));

            expect(searchArtist).not.toHaveBeenCalled();
            expect(searchAlbum).not.toHaveBeenCalled();
        });
    });

    describe("fetching results", () => {
        it("should call searchArtist and searchAlbum with the query", async () => {
            vi.mocked(searchArtist).mockResolvedValueOnce(mockArtists as any);
            vi.mocked(searchAlbum).mockResolvedValueOnce(mockAlbums as any);

            renderHook(() => useSearch("radiohead"));

            await waitFor(() => {
                expect(searchArtist).toHaveBeenCalledWith("radiohead");
                expect(searchAlbum).toHaveBeenCalledWith("radiohead");
            });
        });

        it("should populate artists and albums on success", async () => {
            vi.mocked(searchArtist).mockResolvedValueOnce(mockArtists as any);
            vi.mocked(searchAlbum).mockResolvedValueOnce(mockAlbums as any);

            const { result } = renderHook(() => useSearch("radiohead"));

            await waitFor(() => {
                expect(result.current.artists).toEqual(mockArtists);
                expect(result.current.albums).toEqual(mockAlbums);
            });
        });

        it("should set isSearching to true during fetch and false after", async () => {
            let resolveArtist: (v: any) => void;
            const artistPromise = new Promise((res) => (resolveArtist = res));

            vi.mocked(searchArtist).mockReturnValueOnce(artistPromise as any);
            vi.mocked(searchAlbum).mockResolvedValueOnce(mockAlbums as any);

            const { result } = renderHook(() => useSearch("radiohead"));

            await waitFor(() => expect(result.current.isSearching).toBe(true));

            resolveArtist!(mockArtists);

            await waitFor(() => expect(result.current.isSearching).toBe(false));
        });

        it("should log an error and stop searching when fetch fails", async () => {
            vi.mocked(searchArtist).mockRejectedValueOnce(new Error("API error"));
            vi.mocked(searchAlbum).mockRejectedValueOnce(new Error("API error"));

            const { result } = renderHook(() => useSearch("radiohead"));

            await waitFor(() => {
                expect(console.error).toHaveBeenCalledWith(
                    "Search failed:",
                    expect.any(Error),
                );
            });

            expect(result.current.isSearching).toBe(false);
        });

        it("should slice results to a maximum of 10", async () => {
            const manyArtists = Array.from({ length: 15 }, (_, i) => ({
                name: `Artist ${i}`,
                listeners: "100",
            }));

            vi.mocked(searchArtist).mockResolvedValueOnce(manyArtists as any);
            vi.mocked(searchAlbum).mockResolvedValueOnce(mockAlbums as any);

            const { result } = renderHook(() => useSearch("artist"));

            await waitFor(() => {
                expect(result.current.artists).toHaveLength(10);
            });
        });

        it("should wrap a single non-array result in an array", async () => {
            vi.mocked(searchArtist).mockResolvedValueOnce(mockArtists[0] as any);
            vi.mocked(searchAlbum).mockResolvedValueOnce(mockAlbums[0] as any);

            const { result } = renderHook(() => useSearch("radiohead"));

            await waitFor(() => {
                expect(result.current.artists).toEqual([mockArtists[0]]);
                expect(result.current.albums).toEqual([mockAlbums[0]]);
            });
        });

        it("should return empty arrays when results are null", async () => {
            vi.mocked(searchArtist).mockResolvedValueOnce(null as any);
            vi.mocked(searchAlbum).mockResolvedValueOnce(null as any);

            const { result } = renderHook(() => useSearch("radiohead"));

            await waitFor(() => {
                expect(result.current.artists).toEqual([]);
                expect(result.current.albums).toEqual([]);
            });
        });
    });

    describe("parsePrimaryType / primaryResultType", () => {
        it("should return 'album' when album name matches query exactly and artist does not", async () => {
            const artists = [{ name: "Some Band", listeners: "50000" }];
            const albums = [{ name: "radiohead", artist: {}, image: [] }];

            vi.mocked(searchArtist).mockResolvedValueOnce(artists as any);
            vi.mocked(searchAlbum).mockResolvedValueOnce(albums as any);

            const { result } = renderHook(() => useSearch("radiohead"));

            await waitFor(() => {
                expect(result.current.primaryResultType).toBe("album");
            });
        });

        it("should return 'artist' when artist name matches query exactly and album does not", async () => {
            const artists = [{ name: "radiohead", listeners: "50000" }];
            const albums = [{ name: "OK Computer", artist: {}, image: [] }];

            vi.mocked(searchArtist).mockResolvedValueOnce(artists as any);
            vi.mocked(searchAlbum).mockResolvedValueOnce(albums as any);

            const { result } = renderHook(() => useSearch("radiohead"));

            await waitFor(() => {
                expect(result.current.primaryResultType).toBe("artist");
            });
        });

        it("should return 'artist' when listeners exceed the popularity threshold", async () => {
            const artists = [{ name: "some artist", listeners: "200000" }];
            const albums = [{ name: "some album", artist: {}, image: [] }];

            vi.mocked(searchArtist).mockResolvedValueOnce(artists as any);
            vi.mocked(searchAlbum).mockResolvedValueOnce(albums as any);

            const { result } = renderHook(() => useSearch("something"));

            await waitFor(() => {
                expect(result.current.primaryResultType).toBe("artist");
            });
        });

        it("should return 'album' when listeners are below the popularity threshold", async () => {
            const artists = [{ name: "some artist", listeners: "50000" }];
            const albums = [{ name: "some album", artist: {}, image: [] }];

            vi.mocked(searchArtist).mockResolvedValueOnce(artists as any);
            vi.mocked(searchAlbum).mockResolvedValueOnce(albums as any);

            const { result } = renderHook(() => useSearch("something"));

            await waitFor(() => {
                expect(result.current.primaryResultType).toBe("album");
            });
        });

        it("should return 'album' when listeners field is missing", async () => {
            const artists = [{ name: "some artist" }];
            const albums = [{ name: "some album", artist: {}, image: [] }];

            vi.mocked(searchArtist).mockResolvedValueOnce(artists as any);
            vi.mocked(searchAlbum).mockResolvedValueOnce(albums as any);

            const { result } = renderHook(() => useSearch("something"));

            await waitFor(() => {
                expect(result.current.primaryResultType).toBe("album");
            });
        });
    });

    describe("exposed values", () => {
        it("should expose session and authLoading from auth context", () => {
            const { result } = renderHook(() => useSearch(null));

            expect(result.current.session).toEqual(contextMock.session);
            expect(result.current.authLoading).toBe(false);
        });
    });
});