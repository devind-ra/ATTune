import { describe, it, expect, vi, beforeEach } from "vitest";
import { BskyAgent } from "@atproto/api";

const MOCK_DID = "did:example:123";
const PROFILE_COLLECTION = "app.attune.music.profile";

vi.mock("@atproto/api", () => {
  class MockBskyAgent {
    login = vi.fn();
    com = {
      atproto: {
        repo: {
          createRecord: vi.fn(),
          putRecord: vi.fn(),
          deleteRecord: vi.fn(),
          listRecords: vi.fn(),
          getRecord: vi.fn(),
        },
        server: {
          getSession: vi.fn(),
        },
      },
    };
    app = {
      bsky: {
        feed: {
          searchPosts: vi.fn(),
        },
      },
    };
    resumeSession = vi.fn();
    session = { did: "did:example:123" };
  }
  return {
    BskyAgent: vi.fn(function (this: any) {
      return new MockBskyAgent();
    }),
  };
});

import {
  AtProtoService,
  REVIEW_COLLECTION,
  ERROR_NOT_LOGGED_IN,
} from "@/lib/atproto";

describe("AtProtoService", () => {
  let service: AtProtoService;

  beforeEach(() => {
    vi.clearAllMocks();
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
      };
    })();
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    service = new AtProtoService();
  });

  describe("constructor and session persistence", () => {
    it("should handle session persistence in localStorage", () => {
      const persistSession = (vi.mocked(BskyAgent).mock.calls[0][0] as any)
        .persistSession;

      const mockSess = { did: MOCK_DID, handle: "user.test" };
      persistSession("create", mockSess);
      expect(localStorage.getItem("atp_session")).toContain(MOCK_DID);

      persistSession("expired");
      expect(localStorage.getItem("atp_session")).toBeNull();
    });
  });

  describe("login", () => {
    it("should login successfully and return session", async () => {
      const mockSession = { did: MOCK_DID };
      vi.mocked(service.agent.login).mockResolvedValueOnce({
        success: true,
        data: mockSession,
      } as any);
      (service.agent as any).session = mockSession;

      const result = await service.login("id", "pass");
      expect(result).toEqual(mockSession);
      expect(service.agent.login).toHaveBeenCalled();
    });
  });

  describe("createReview", () => {
    it("should throw error if not logged in", async () => {
      (service.agent as any).session = undefined;
      type ReviewParams = Parameters<typeof service.createReview>[0];

      await expect(service.createReview({} as ReviewParams)).rejects.toThrow(
        ERROR_NOT_LOGGED_IN,
      );
    });

    it("should create a record with injected $type and createdAt", async () => {
      const mockCreateRecord = service.agent.com.atproto.repo.createRecord;
      const review = {
        subjectTitle: "Title",
        subjectArtist: "Artist",
        rating: 5,
        listenedAt: "2023",
      };

      await service.createReview(review);

      expect(mockCreateRecord).toHaveBeenCalledWith({
        repo: MOCK_DID,
        collection: REVIEW_COLLECTION,
        record: {
          $type: REVIEW_COLLECTION,
          createdAt: expect.any(String),
          ...review,
        },
      });
    });

    it("should truncate long review text and create a bsky post", async () => {
      const mockCreate = service.agent.com.atproto.repo.createRecord;
      const longText = "a".repeat(300);
      const review = {
        subjectTitle: "Title",
        subjectArtist: "Artist",
        rating: 10,
        text: longText,
        listenedAt: "2023",
      };

      await service.createReview(review);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: "app.bsky.feed.post",
          record: expect.objectContaining({
            text: expect.stringContaining("aaa..."),
          }),
        }),
      );
      const postCall = vi.mocked(mockCreate).mock.calls[0][0] as any;
      expect(postCall.record.text.length).toBeLessThan(300);
    });

    it("should handle error when creating bsky post fails and still create the review", async () => {
      const mockCreateRecord = service.agent.com.atproto.repo.createRecord;
      const originalConsoleWarn = console.warn;
      console.warn = vi.fn();

      vi.mocked(mockCreateRecord).mockRejectedValueOnce(
        new Error("bsky post error"),
      );

      await service.createReview({
        subjectTitle: "Title",
        subjectArtist: "Artist",
        rating: 5,
        listenedAt: "2023",
      });

      expect(console.warn).toHaveBeenCalledWith(
        "Failed to create Bsky text post",
        expect.any(Error),
      );
      expect(mockCreateRecord).toHaveBeenCalledTimes(2); // once for post (failed/caught), once for review

      console.warn = originalConsoleWarn;
    });
  });

  describe("updateReview", () => {
    it("should extract rkey from uri and injects updatedAt", async () => {
      const mockPutRecord = service.agent.com.atproto.repo.putRecord;
      const review = {
        subjectTitle: "Title",
        subjectArtist: "Artist",
        rating: 4,
        listenedAt: "2023",
      };
      const uri = "at://did:example:123/app.attune.music.review/3kxyz";

      await service.updateReview(uri, review, "2023-01-01T00:00:00.000Z");

      expect(mockPutRecord).toHaveBeenCalledWith({
        repo: MOCK_DID,
        collection: REVIEW_COLLECTION,
        rkey: "3kxyz",
        record: {
          $type: REVIEW_COLLECTION,
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: expect.any(String),
          ...review,
        },
      });
    });

    it("should throw error if not logged in", async () => {
      (service.agent as any).session = undefined;
      await expect(
        service.updateReview("uri", {} as any, "2023"),
      ).rejects.toThrow(ERROR_NOT_LOGGED_IN);
    });
  });

  describe("deleteReview", () => {
    it("should extract rkey from uri and calls deleteRecord", async () => {
      const mockDeleteRecord = service.agent.com.atproto.repo.deleteRecord;
      const uri = "at://did:example:123/app.attune.music.review/3kxyz";

      await service.deleteReview(uri);

      expect(mockDeleteRecord).toHaveBeenCalledWith({
        repo: MOCK_DID,
        collection: REVIEW_COLLECTION,
        rkey: "3kxyz",
      });
    });

    it("should throw error if not logged in", async () => {
      (service.agent as any).session = undefined;
      await expect(service.deleteReview("uri")).rejects.toThrow(
        ERROR_NOT_LOGGED_IN,
      );
    });
  });

  describe("getReviews", () => {
    it("should list records and map them", async () => {
      const publicAgent = (service as any).publicAgent;
      const mockList = publicAgent.com.atproto.repo.listRecords;

      vi.mocked(mockList).mockResolvedValueOnce({
        data: { records: [{ uri: "u1", cid: "c1", value: { rating: 10 } }] },
      } as any);
      const res = await service.getReviews("did:other");

      expect(mockList).toHaveBeenCalledWith(
        expect.objectContaining({ repo: "did:other" }),
      );
      expect(res).toEqual([
        { uri: "u1", cid: "c1", value: { rating: 10 }, author: "did:other" },
      ]);
    });
  });

  describe("getOtherReviews", () => {
    it("should return empty if not logged in", async () => {
      (service.agent as any).session = undefined;
      const res = await service.getOtherReviews("A", "B", "C");
      expect(res).toEqual([]);
    });

    it("should return empty if searchPosts fails", async () => {
      const originalConsoleWarn = console.warn;
      console.warn = vi.fn();
      vi.mocked(
        (service.agent as any).app.bsky.feed.searchPosts,
      ).mockRejectedValueOnce(new Error("fail"));

      const res = await service.getOtherReviews("A", "B", "C");
      expect(res).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to fetch other reviews via text search",
        expect.any(Error),
      );

      console.warn = originalConsoleWarn;
    });

    it("should parse correctly matched posts and ignore own posts or mismatches", async () => {
      const mockSearch = (service.agent as any).app.bsky.feed.searchPosts;
      vi.mocked(mockSearch).mockResolvedValueOnce({
        data: {
          posts: [
            {
              author: { did: MOCK_DID },
              record: {
                text: "I just reviewed Title by Artist!\n\nRating: 4.5/5",
              },
            },
            {
              author: { did: "did:other" },
              uri: "u2",
              cid: "c2",
              record: {
                text: "I just reviewed Title by Artist!\n\nRating: 4.5/5\n\nGreat!",
              },
            },
            { author: { did: "did:other" }, record: {} },
            { author: { did: "did:other" }, record: { text: "Random post" } },
            {
              author: { did: "did:other" },
              record: {
                text: "I just reviewed Wrong by Artist!\n\nRating: 4/5",
              },
            },
          ],
        },
      } as any);

      const res = await service.getOtherReviews("Title", "Artist", MOCK_DID);
      expect(res).toHaveLength(1);
      expect(res[0].uri).toBe("u2");
      expect(res[0].value.rating).toBe(9);
      expect(res[0].value.text).toBe("Great!");
    });
  });

  describe("resumeSession", () => {
    it("should resume and verify session successfully", async () => {
      vi.mocked(
        service.agent.com.atproto.server.getSession,
      ).mockResolvedValueOnce({
        data: { did: "did:test:123" },
      } as any);
      const mockSession = { did: "did:test:123" } as any;

      await service.resumeSession(mockSession);
      expect(service.agent.resumeSession).toHaveBeenCalledWith(mockSession);
      expect(service.agent.com.atproto.server.getSession).toHaveBeenCalled();
    });

    it("should throw if verification fails", async () => {
      vi.mocked(
        service.agent.com.atproto.server.getSession,
      ).mockResolvedValueOnce({
        data: { did: "did:wrong:456" },
      } as any);

      await expect(
        service.resumeSession({ did: "did:test:123" } as any),
      ).rejects.toThrow("Session verification failed");
    });
  });

  describe("getTastes, updateTastes, deleteTastes", () => {
    it("should fetch user tastes", async () => {
      const mockGet = service.agent.com.atproto.repo.getRecord;
      const mockTastes = { topArtists: ["Radiohead"], topGenres: ["Rock"] };
      vi.mocked(mockGet).mockResolvedValueOnce({
        data: { value: mockTastes },
      } as any);

      const result = await service.getTastes(MOCK_DID);
      expect(result).toEqual(mockTastes);
    });

    it("should update user tastes", async () => {
      const mockPut = service.agent.com.atproto.repo.putRecord;
      const tastes = { topArtists: ["Radiohead"], topGenres: ["Rock"] };

      await service.updateTastes(tastes);

      expect(mockPut).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: PROFILE_COLLECTION,
          record: expect.objectContaining({
            topArtists: ["Radiohead"],
            updatedAt: expect.any(String),
          }),
        }),
      );
    });

    it("should return null if fetching tastes fails", async () => {
      const mockGet = service.agent.com.atproto.repo.getRecord;
      vi.mocked(mockGet).mockRejectedValueOnce(new Error("fail"));

      const result = await service.getTastes(MOCK_DID);
      expect(result).toBeNull();
    });

    it("should throw error if updating tastes and not logged in", async () => {
      (service.agent as any).session = undefined;
      await expect(
        service.updateTastes({ topArtists: [], topGenres: [] }),
      ).rejects.toThrow(ERROR_NOT_LOGGED_IN);
    });

    it("should delete user tastes", async () => {
      const mockDelete = service.agent.com.atproto.repo.deleteRecord;
      await service.deleteTastes();
      expect(mockDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: PROFILE_COLLECTION,
          rkey: "self",
        }),
      );
    });

    it("should gracefully catch error if deleting tastes fails", async () => {
      const mockDelete = service.agent.com.atproto.repo.deleteRecord;
      vi.mocked(mockDelete).mockRejectedValueOnce(new Error("fail"));

      const originalConsoleWarn = console.warn;
      console.warn = vi.fn();

      await service.deleteTastes();

      expect(console.warn).toHaveBeenCalledWith(
        "No tastes found to delete or delete failed",
        expect.any(Error),
      );

      console.warn = originalConsoleWarn;
    });

    it("should throw error if deleting tastes and not logged in", async () => {
      (service.agent as any).session = undefined;
      await expect(service.deleteTastes()).rejects.toThrow(ERROR_NOT_LOGGED_IN);
    });
  });
});
