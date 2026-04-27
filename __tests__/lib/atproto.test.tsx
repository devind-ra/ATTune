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
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    service = new AtProtoService();
  });

  describe("window undefined / SSR environment", () => {
    it("should not access localStorage if window is undefined", () => {
      const originalWindow = global.window;
      // @ts-expect-error - simulating SSR
      delete global.window;

      expect(() => new AtProtoService()).not.toThrow();

      global.window = originalWindow;
    });
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

    it("should remove session from localStorage on create-failed event (line 59-60)", () => {
      const persistSession = (vi.mocked(BskyAgent).mock.calls[0][0] as any)
        .persistSession;

      localStorage.setItem("atp_session", JSON.stringify({ did: MOCK_DID }));
      persistSession("create-failed");
      expect(localStorage.getItem("atp_session")).toBeNull();
    });

    it("should do nothing for unrecognised event with no session (line 56-62)", () => {
      const persistSession = (vi.mocked(BskyAgent).mock.calls[0][0] as any)
        .persistSession;

      localStorage.setItem("atp_session", JSON.stringify({ did: MOCK_DID }));
      persistSession("update");
      expect(localStorage.getItem("atp_session")).toContain(MOCK_DID);
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

    it("should throw 'Session not created' if session is null after login", async () => {
      vi.mocked(service.agent.login).mockResolvedValueOnce({
        success: true,
        data: {},
      } as any);
      (service.agent as any).session = null;

      await expect(service.login("id", "pass")).rejects.toThrow(
        "Session not created",
      );
    });
  });

  describe("truncateReviewText", () => {
    it("should return empty string if text is undefined", async () => {
      const mockCreateRecord = service.agent.com.atproto.repo.createRecord;

      await service.createReview({
        subjectTitle: "Title",
        subjectArtist: "Artist",
        rating: 5,
        listenedAt: "2026",
      });

      const bskyCall = vi.mocked(mockCreateRecord).mock.calls[0][0] as any;
      expect(bskyCall.record.text).toContain(
        "I just reviewed Title by Artist!",
      );
      expect(bskyCall.record.text).toContain("Rating: 2.5/5");
    });

    it("should return text as-is if within maxLength", async () => {
      const mockCreateRecord = service.agent.com.atproto.repo.createRecord;
      const shortText = "short";

      await service.createReview({
        subjectTitle: "Title",
        subjectArtist: "Artist",
        rating: 5,
        listenedAt: "2026",
        text: shortText,
      });

      const bskyCall = vi.mocked(mockCreateRecord).mock.calls[0][0] as any;
      expect(bskyCall.record.text).toContain("short");
      expect(bskyCall.record.text).not.toContain("...");
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
      expect(mockCreateRecord).toHaveBeenCalledTimes(2);

      console.warn = originalConsoleWarn;
    });

    it("should skip bsky post and still create review record", async () => {
      const mockCreateRecord = service.agent.com.atproto.repo.createRecord;

      await service.createReview(
        {
          subjectTitle: "Title",
          subjectArtist: "Artist",
          rating: 5,
          listenedAt: "2023",
        },
        false,
      );

      expect(mockCreateRecord).toHaveBeenCalledTimes(1);
      expect(mockCreateRecord).toHaveBeenCalledWith(
        expect.objectContaining({ collection: REVIEW_COLLECTION }),
      );
    });

    it("should set postUri and postCid from bsky post response on review record", async () => {
      const mockCreateRecord = service.agent.com.atproto.repo.createRecord;

      vi.mocked(mockCreateRecord).mockResolvedValueOnce({
        success: true,
        data: { uri: "at://post/uri", cid: "post-cid" },
      } as any);

      await service.createReview({
        subjectTitle: "Title",
        subjectArtist: "Artist",
        rating: 5,
        listenedAt: "2023",
      });

      const reviewCall = vi.mocked(mockCreateRecord).mock.calls[1][0] as any;
      expect(reviewCall.record.postUri).toBe("at://post/uri");
      expect(reviewCall.record.postCid).toBe("post-cid");
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

    it("should use uri directly as rkey if it has no slashes", async () => {
      const mockPutRecord = service.agent.com.atproto.repo.putRecord;

      await service.updateReview(
        "barerkey",
        {
          subjectTitle: "T",
          subjectArtist: "A",
          rating: 4,
          listenedAt: "2023",
        },
        "2023-01-01T00:00:00.000Z",
      );

      expect(mockPutRecord).toHaveBeenCalledWith(
        expect.objectContaining({ rkey: "barerkey" }),
      );
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

    it("should paginate using cursor until exhausted", async () => {
      const publicAgent = (service as any).publicAgent;
      const mockList = publicAgent.com.atproto.repo.listRecords;

      vi.mocked(mockList)
        .mockResolvedValueOnce({
          data: {
            records: [{ uri: "u1", cid: "c1", value: { rating: 8 } }],
            cursor: "next-page-cursor",
          },
        } as any)
        .mockResolvedValueOnce({
          data: {
            records: [{ uri: "u2", cid: "c2", value: { rating: 6 } }],
            cursor: undefined,
          },
        } as any);

      const res = await service.getReviews("did:other");

      expect(mockList).toHaveBeenCalledTimes(2);
      expect(res).toHaveLength(2);
      expect(res[0].uri).toBe("u1");
      expect(res[1].uri).toBe("u2");
    });

    it("should return empty array and warn if listRecords throws", async () => {
      const publicAgent = (service as any).publicAgent;
      const mockList = publicAgent.com.atproto.repo.listRecords;
      const originalConsoleWarn = console.warn;
      console.warn = vi.fn();

      vi.mocked(mockList).mockRejectedValueOnce(new Error("network error"));

      const res = await service.getReviews("did:other");

      expect(res).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        "Could not fetch reviews for user",
        expect.any(Error),
      );

      console.warn = originalConsoleWarn;
    });

    it("should use authenticated agent when fetching own reviews", async () => {
      const mockList = service.agent.com.atproto.repo.listRecords;
      vi.mocked(mockList).mockResolvedValueOnce({
        data: { records: [], cursor: undefined },
      } as any);

      await service.getReviews(MOCK_DID);

      expect(mockList).toHaveBeenCalled();
    });
  });

  describe("parsePostToReview text fallback", () => {
    it("should set text to empty string when post has no text section", async () => {
      const mockSearch = (service.agent as any).app.bsky.feed.searchPosts;

      vi.mocked(mockSearch).mockResolvedValueOnce({
        data: {
          posts: [
            {
              author: { did: "did:other" },
              uri: "u1",
              cid: "c1",
              record: {
                text: "I just reviewed Title by Artist!\n\nRating: 4/5",
              },
            },
          ],
        },
      } as any);

      const res = await service.getOtherReviews("Title", "Artist", MOCK_DID);

      expect(res).toHaveLength(1);
      expect(res[0].value.text).toBe("");
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

    it("should use publicAgent when fetching another user's tastes", async () => {
      const publicAgent = (service as any).publicAgent;
      const mockGet = publicAgent.com.atproto.repo.getRecord;

      vi.mocked(mockGet).mockResolvedValueOnce({
        data: { value: { topArtists: [], topGenres: [] } },
      } as any);

      await service.getTastes("did:someone-else");

      expect(mockGet).toHaveBeenCalled();
      expect(service.agent.com.atproto.repo.getRecord).not.toHaveBeenCalled();
    });

    it("should use authenticated agent when fetching own tastes", async () => {
      const mockGet = service.agent.com.atproto.repo.getRecord;
      vi.mocked(mockGet).mockResolvedValueOnce({
        data: { value: { topArtists: [], topGenres: [] } },
      } as any);

      await service.getTastes(MOCK_DID);

      expect(mockGet).toHaveBeenCalled();
    });
  });

  describe("updateBlueskyPost (via updateReview)", () => {
    it("should call putRecord for bsky post when postUri is present", async () => {
      const mockPutRecord = service.agent.com.atproto.repo.putRecord;
      const review = {
        subjectTitle: "Title",
        subjectArtist: "Artist",
        rating: 8,
        listenedAt: "2023",
        postUri: "at://did:example:123/app.bsky.feed.post/abc123",
      };

      await service.updateReview(
        "at://did:example:123/app.attune.music.review/rkey1",
        review,
        "2023-01-01T00:00:00.000Z",
      );

      expect(mockPutRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: "app.bsky.feed.post",
          rkey: "abc123",
          record: expect.objectContaining({
            $type: "app.bsky.feed.post",
            text: expect.stringContaining("Title"),
          }),
        }),
      );
    });

    it("should truncate long text in bsky post update", async () => {
      const mockPutRecord = service.agent.com.atproto.repo.putRecord;
      const longText = "b".repeat(300);
      const review = {
        subjectTitle: "Title",
        subjectArtist: "Artist",
        rating: 8,
        listenedAt: "2023",
        text: longText,
        postUri: "at://did:example:123/app.bsky.feed.post/abc123",
      };

      await service.updateReview(
        "at://did:example:123/app.attune.music.review/rkey1",
        review,
        "2023-01-01T00:00:00.000Z",
      );

      const bskyCall = vi.mocked(mockPutRecord).mock.calls[0][0] as any;
      expect(bskyCall.record.text).toContain("bbb...");
    });

    it("should warn and continue if bsky post update fails", async () => {
      const mockPutRecord = service.agent.com.atproto.repo.putRecord;
      const originalConsoleWarn = console.warn;
      console.warn = vi.fn();

      vi.mocked(mockPutRecord).mockRejectedValueOnce(new Error("put failed"));

      const review = {
        subjectTitle: "Title",
        subjectArtist: "Artist",
        rating: 8,
        listenedAt: "2023",
        postUri: "at://did:example:123/app.bsky.feed.post/abc123",
      };

      await service.updateReview(
        "at://did:example:123/app.attune.music.review/rkey1",
        review,
        "2023-01-01T00:00:00.000Z",
      );

      expect(console.warn).toHaveBeenCalledWith(
        "Failed to update Bsky text post",
        expect.any(Error),
      );
      expect(mockPutRecord).toHaveBeenCalledTimes(2);

      console.warn = originalConsoleWarn;
    });

    it("should use postUri as rkey if it has no slashes", async () => {
      const mockPutRecord = service.agent.com.atproto.repo.putRecord;

      const review = {
        subjectTitle: "Title",
        subjectArtist: "Artist",
        rating: 8,
        listenedAt: "2023",
        postUri: "barerkey",
      };

      await service.updateReview(
        "at://did:example:123/app.attune.music.review/rkey1",
        review,
        "2023-01-01T00:00:00.000Z",
      );

      const bskyCall = vi.mocked(mockPutRecord).mock.calls[0][0] as any;
      expect(bskyCall.rkey).toBe("barerkey");
    });
  });

  describe("getPostMetrics", () => {
    it("should return like count and viewerLike when post exists", async () => {
      (service.agent as any).getPosts = vi.fn().mockResolvedValueOnce({
        data: {
          posts: [{ likeCount: 5, viewer: { like: "at://like/uri" } }],
        },
      });

      const result = await service.getPostMetrics("at://post/uri");

      expect(result).toEqual({ likeCount: 5, viewerLike: "at://like/uri" });
    });

    it("should return zero defaults if post is not found in response", async () => {
      (service.agent as any).getPosts = vi.fn().mockResolvedValueOnce({
        data: { posts: [] },
      });

      const result = await service.getPostMetrics("at://post/uri");

      expect(result).toEqual({ likeCount: 0, viewerLike: undefined });
    });

    it("should return zero defaults if getPosts throws", async () => {
      (service.agent as any).getPosts = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail"));

      const result = await service.getPostMetrics("at://post/uri");

      expect(result).toEqual({ likeCount: 0, viewerLike: undefined });
    });

    it("should return zero defaults if not logged in", async () => {
      (service.agent as any).session = undefined;

      const result = await service.getPostMetrics("at://post/uri");

      expect(result).toEqual({ likeCount: 0, viewerLike: undefined });
    });

    it("should return 0 for likeCount when post has no likeCount field", async () => {
      (service.agent as any).getPosts = vi.fn().mockResolvedValueOnce({
        data: {
          posts: [{ viewer: {} }],
        },
      });

      const result = await service.getPostMetrics("at://post/uri");

      expect(result.likeCount).toBe(0);
    });
  });

  describe("likePost", () => {
    it("should create a like record", async () => {
      const mockCreateRecord = service.agent.com.atproto.repo.createRecord;

      await service.likePost("at://post/uri", "cid123");

      expect(mockCreateRecord).toHaveBeenCalledWith({
        repo: MOCK_DID,
        collection: "app.bsky.feed.like",
        record: {
          subject: { uri: "at://post/uri", cid: "cid123" },
          createdAt: expect.any(String),
        },
      });
    });

    it("should throw if not logged in", async () => {
      (service.agent as any).session = undefined;
      await expect(service.likePost("uri", "cid")).rejects.toThrow(
        ERROR_NOT_LOGGED_IN,
      );
    });
  });

  describe("unlikePost", () => {
    it("should delete the like record using rkey from uri", async () => {
      const mockDeleteRecord = service.agent.com.atproto.repo.deleteRecord;

      await service.unlikePost(
        "at://did:example:123/app.bsky.feed.like/likerkey",
      );

      expect(mockDeleteRecord).toHaveBeenCalledWith({
        repo: MOCK_DID,
        collection: "app.bsky.feed.like",
        rkey: "likerkey",
      });
    });

    it("should throw if not logged in", async () => {
      (service.agent as any).session = undefined;
      await expect(service.unlikePost("uri")).rejects.toThrow(
        ERROR_NOT_LOGGED_IN,
      );
    });

    it("should use likeUri directly as rkey if it has no slashes", async () => {
      const mockDeleteRecord = service.agent.com.atproto.repo.deleteRecord;

      await service.unlikePost("barerkey");

      expect(mockDeleteRecord).toHaveBeenCalledWith(
        expect.objectContaining({ rkey: "barerkey" }),
      );
    });
  });

  describe("searchUsers", () => {
    it("should return actors on success", async () => {
      (service.agent as any).searchActorsTypeahead = vi
        .fn()
        .mockResolvedValueOnce({
          data: { actors: [{ did: "did:other", handle: "user.test" }] },
        });

      const result = await service.searchUsers("user");

      expect(result).toEqual([{ did: "did:other", handle: "user.test" }]);
    });

    it("should return empty array and warn if searchActorsTypeahead throws", async () => {
      const originalConsoleWarn = console.warn;
      console.warn = vi.fn();

      (service.agent as any).searchActorsTypeahead = vi
        .fn()
        .mockRejectedValueOnce(new Error("search failed"));

      const result = await service.searchUsers("user");

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to search users",
        expect.any(Error),
      );

      console.warn = originalConsoleWarn;
    });
  });

  describe("followUser and unfollowUser", () => {
    it("should call agent.follow with the given did", async () => {
      (service.agent as any).follow = vi.fn().mockResolvedValueOnce({});

      await service.followUser("did:other:456");

      expect((service.agent as any).follow).toHaveBeenCalledWith(
        "did:other:456",
      );
    });

    it("should throw if not logged in when following", async () => {
      (service.agent as any).session = undefined;
      await expect(service.followUser("did:other:456")).rejects.toThrow(
        ERROR_NOT_LOGGED_IN,
      );
    });

    it("should call agent.deleteFollow with the given uri", async () => {
      (service.agent as any).deleteFollow = vi.fn().mockResolvedValueOnce({});

      await service.unfollowUser("at://follow/uri");

      expect((service.agent as any).deleteFollow).toHaveBeenCalledWith(
        "at://follow/uri",
      );
    });

    it("should throw if not logged in when unfollowing", async () => {
      (service.agent as any).session = undefined;
      await expect(service.unfollowUser("at://follow/uri")).rejects.toThrow(
        ERROR_NOT_LOGGED_IN,
      );
    });
  });
});
