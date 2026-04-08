// AT Protocol Service
// Contains the following:
// - Interfaces for storing user data on AT Protocol
// - Functions for logging in, creating, updating, and deleting reviews
// - Functions for getting user data from AT Protocol

import { BskyAgent, AtpSessionData } from "@atproto/api";

export const REVIEW_COLLECTION = "app.attune.music.review";
export const PROFILE_COLLECTION = "app.attune.music.profile";
export const ERROR_NOT_LOGGED_IN = "Not logged in";

export type AuthSession = AtpSessionData;

export interface MusicReview {
  subjectTitle: string;
  subjectArtist: string;
  rating: number;
  text?: string;
  createdAt: string;
  updatedAt?: string;
  listenedAt: string;
  postUri?: string;
  postCid?: string;
}

export interface UserTastes {
  topArtists: string[];
  topGenres: string[];
  updatedAt: string;
}

export interface ReviewRecord {
  uri: string;
  cid: string;
  value: MusicReview;
  author?: string;
}

export class AtProtoService {
  public agent: BskyAgent;

  constructor() {
    this.agent = new BskyAgent({
      service: "https://bsky.social",
      persistSession: (evt, sess) => {
        if (typeof window !== "undefined") {
          if (sess) {
            localStorage.setItem("atp_session", JSON.stringify(sess));
          } else if (evt === "expired" || evt === "create-failed") {
            localStorage.removeItem("atp_session");
          }
        }
      },
    });
  }

  async login(identifier: string, password: string) {
    await this.agent.login({ identifier, password });
    if (!this.agent.session) throw new Error("Session not created");
    return this.agent.session;
  }

  async createReview(
    review: Omit<MusicReview, "createdAt" | "postUri" | "postCid">,
  ) {
    if (!this.agent.session) {
      throw new Error(ERROR_NOT_LOGGED_IN);
    }

    const createdAt = new Date().toISOString();
    const ellipsis = review.text && review.text.length > 200 ? "..." : "";
    const truncatedText = review.text
      ? review.text.substring(0, 200) + ellipsis
      : "";

    const postRecord = {
      $type: "app.bsky.feed.post",
      text: `I just reviewed ${review.subjectTitle} by ${review.subjectArtist}!\n\nRating: ${review.rating}/5\n\n${truncatedText}`,
      createdAt: createdAt,
    };

    let postRes;
    try {
      postRes = await this.agent.com.atproto.repo.createRecord({
        repo: this.agent.session.did,
        collection: "app.bsky.feed.post",
        record: postRecord,
      });
    } catch (err) {
      console.warn("Failed to create Bsky text post", err);
    }

    const record = {
      $type: REVIEW_COLLECTION,
      createdAt,
      postUri: postRes?.data?.uri,
      postCid: postRes?.data?.cid,
      ...review,
    };

    return await this.agent.com.atproto.repo.createRecord({
      repo: this.agent.session.did,
      collection: REVIEW_COLLECTION,
      record: record,
    });
  }

  async updateReview(
    uri: string,
    review: Omit<MusicReview, "createdAt" | "updatedAt">,
    createdAt: string,
  ) {
    if (!this.agent.session) {
      throw new Error(ERROR_NOT_LOGGED_IN);
    }

    const rkey = uri.split("/").pop() || uri;

    const record = {
      $type: REVIEW_COLLECTION,
      createdAt: createdAt,
      updatedAt: new Date().toISOString(),
      ...review,
    };

    return await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session.did,
      collection: REVIEW_COLLECTION,
      rkey: rkey,
      record: record,
    });
  }

  async deleteReview(uri: string) {
    if (!this.agent.session) {
      throw new Error(ERROR_NOT_LOGGED_IN);
    }

    const rkey = uri.split("/").pop() || uri;

    return await this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session.did,
      collection: REVIEW_COLLECTION,
      rkey: rkey,
    });
  }

  async getReviews(did: string) {
    const response = await this.agent.com.atproto.repo.listRecords({
      repo: did,
      collection: REVIEW_COLLECTION,
      limit: 50,
    });

    return response.data.records.map((r) => ({
      uri: r.uri,
      cid: r.cid,
      value: r.value as unknown as MusicReview,
      author: did,
    }));
  }

  async resumeSession(session: AuthSession) {
    await this.agent.resumeSession(session);
    const { data } = await this.agent.com.atproto.server.getSession();
    if (data.did !== session.did) {
      throw new Error("Session verification failed");
    }
  }

  async getTastes(did: string) {
    try {
      const response = await this.agent.com.atproto.repo.getRecord({
        repo: did,
        collection: PROFILE_COLLECTION,
        rkey: "self",
      });
      return response.data.value as unknown as UserTastes;
    } catch {
      return null;
    }
  }

  async updateTastes(tastes: Omit<UserTastes, "updatedAt">) {
    if (!this.agent.session) {
      throw new Error(ERROR_NOT_LOGGED_IN);
    }

    const record = {
      $type: PROFILE_COLLECTION,
      updatedAt: new Date().toISOString(),
      ...tastes,
    };

    return await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session.did,
      collection: PROFILE_COLLECTION,
      rkey: "self",
      record: record,
    });
  }
}

export const atApiService = new AtProtoService();
