import { describe, it, expect, vi, beforeEach } from "vitest";

const MOCK_DID = "did:example:123";

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
    resumeSession = vi.fn();
    session = { did: "did:example:123" };
  }
  return {
    BskyAgent: MockBskyAgent,
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
    service = new AtProtoService();
  });

  describe("createReview", () => {
    it("throws error if not logged in", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service.agent as any).session = undefined;
      type ReviewParams = Parameters<typeof service.createReview>[0];

      await expect(service.createReview({} as ReviewParams)).rejects.toThrow(
        ERROR_NOT_LOGGED_IN,
      );
    });

    it("creates a record with injected $type and createdAt", async () => {
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
  });

  describe("updateReview", () => {
    it("extracts rkey from uri and injects updatedAt", async () => {
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
  });

  describe("deleteReview", () => {
    it("extracts rkey from uri and calls deleteRecord", async () => {
      const mockDeleteRecord = service.agent.com.atproto.repo.deleteRecord;
      const uri = "at://did:example:123/app.attune.music.review/3kxyz";

      await service.deleteReview(uri);

      expect(mockDeleteRecord).toHaveBeenCalledWith({
        repo: MOCK_DID,
        collection: REVIEW_COLLECTION,
        rkey: "3kxyz",
      });
    });
  });
});
