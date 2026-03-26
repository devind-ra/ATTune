import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSearch } from "@/app/hooks/useSearch";
import { searchArtist, searchAlbum } from "@/lib/lastfm";

interface MockArtist {
  name: string;
  listeners?: string;
}

interface MockAlbum {
  name: string;
  artist: { name?: string };
  image: string[];
}

interface MockSession {
  did: string;
  handle: string;
}

const TEST_QUERY = "radiohead";
const SOME_ARTIST = "some artist";
const SOME_ALBUM = "some album";

const routerPushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
}));

const contextMock = {
  session: {
    did: "did:plc:123",
    handle: "testuser.bsky.social",
  } as MockSession | null,
  isLoading: false,
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => contextMock,
}));

vi.mock("@/lib/lastfm", () => ({
  searchArtist: vi.fn(),
  searchAlbum: vi.fn(),
}));

const mockArtists: MockArtist[] = [
  { name: "Radiohead", listeners: "3000000" },
  { name: "Radiohead tribute", listeners: "50000" },
];

const mockAlbums: MockAlbum[] = [
  { name: "OK Computer", artist: { name: "Radiohead" }, image: [] },
  { name: "The Bends", artist: { name: "Radiohead" }, image: [] },
];

describe("useSearch hook: Auth & Init", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    contextMock.session = {
      did: "did:plc:123",
      handle: "testuser.bsky.social",
    };
    contextMock.isLoading = false;
  });

  it("should redirect to / when not loading and no session", async () => {
    contextMock.session = null;
    renderHook(() => useSearch(null));
    await waitFor(() => expect(routerPushMock).toHaveBeenCalledWith("/"));
  });

  it("should initialise with empty results and default state", () => {
    const { result } = renderHook(() => useSearch(null));
    expect(result.current.artists).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });
});

describe("useSearch hook: Fetching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should populate artists and albums on success", async () => {
    vi.mocked(searchArtist).mockResolvedValueOnce(mockArtists);
    vi.mocked(searchAlbum).mockResolvedValueOnce(mockAlbums);

    const { result } = renderHook(() => useSearch(TEST_QUERY));

    await waitFor(() => {
      expect(result.current.artists).toEqual(mockArtists);
      expect(result.current.albums).toEqual(mockAlbums);
    });
  });

  it("should set isSearching to true during fetch", async () => {
    // Replaced 'any' with specific types for the promise
    let resolveArtist!: (v: MockArtist[]) => void;
    const artistPromise = new Promise<MockArtist[]>((res) => {
      resolveArtist = res;
    });

    vi.mocked(searchArtist).mockReturnValueOnce(artistPromise);
    vi.mocked(searchAlbum).mockResolvedValueOnce(mockAlbums);

    const { result } = renderHook(() => useSearch(TEST_QUERY));
    await waitFor(() => expect(result.current.isSearching).toBe(true));

    resolveArtist(mockArtists);
    await waitFor(() => expect(result.current.isSearching).toBe(false));
  });

  it("should wrap a single non-array result in an array", async () => {
    vi.mocked(searchArtist).mockResolvedValueOnce(
      mockArtists[0] as unknown as MockArtist[],
    );
    vi.mocked(searchAlbum).mockResolvedValueOnce(
      mockAlbums[0] as unknown as MockAlbum[],
    );

    const { result } = renderHook(() => useSearch(TEST_QUERY));

    await waitFor(() => {
      expect(result.current.artists).toEqual([mockArtists[0]]);
    });
  });
});

describe("useSearch hook: parsePrimaryType logic", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return 'artist' when listeners exceed popularity threshold", async () => {
    const artists = [{ name: SOME_ARTIST, listeners: "200000" }];
    const albums = [{ name: SOME_ALBUM, artist: {}, image: [] }];

    vi.mocked(searchArtist).mockResolvedValueOnce(artists);
    vi.mocked(searchAlbum).mockResolvedValueOnce(albums);

    const { result } = renderHook(() => useSearch("something"));

    await waitFor(() => {
      expect(result.current.primaryResultType).toBe("artist");
    });
  });

  it("should return 'album' when listeners field is missing", async () => {
    const artists = [{ name: SOME_ARTIST }];
    const albums = [{ name: SOME_ALBUM, artist: {}, image: [] }];

    vi.mocked(searchArtist).mockResolvedValueOnce(artists);
    vi.mocked(searchAlbum).mockResolvedValueOnce(albums);

    const { result } = renderHook(() => useSearch("something"));

    await waitFor(() => {
      expect(result.current.primaryResultType).toBe("album");
    });
  });
});
