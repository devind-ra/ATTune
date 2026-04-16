/* eslint-disable max-lines */
// AT Protocol Service
// Contains the following:
// - Interfaces for storing user data on AT Protocol
// - Functions for logging in, creating, updating, and deleting reviews
// - Functions for getting user data from AT Protocol
// - Functions for getting other users' reviews

import {
  BskyAgent,
  AtpSessionData,
  AppBskyActorDefs,
  AppBskyFeedDefs,
} from "@atproto/api";

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
  author?: string | AppBskyActorDefs.ProfileViewBasic;
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

  private truncateReviewText(
    text: string | undefined,
    maxLength = 200,
  ): string {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  private async createBlueskyPost(
    review: Omit<MusicReview, "createdAt" | "postUri" | "postCid">,
    createdAt: string,
  ) {
    const truncatedText = this.truncateReviewText(review.text);
    const postRecord = {
      $type: "app.bsky.feed.post",
      text: `I just reviewed ${review.subjectTitle} by ${review.subjectArtist}!\n\nRating: ${review.rating / 2}/5\n\n${truncatedText}`,
      createdAt,
    };

    try {
      return await this.agent.com.atproto.repo.createRecord({
        repo: this.agent.session!.did,
        collection: "app.bsky.feed.post",
        record: postRecord,
      });
    } catch (err) {
      console.warn("Failed to create Bsky text post", err);
    }
  }

  async createReview(
    review: Omit<MusicReview, "createdAt" | "postUri" | "postCid">,
    publishToBluesky: boolean = true,
  ) {
    if (!this.agent.session) {
      throw new Error(ERROR_NOT_LOGGED_IN);
    }

    const createdAt = new Date().toISOString();
    const postRes = publishToBluesky
      ? await this.createBlueskyPost(review, createdAt)
      : undefined;

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

  async getReviews(did: string): Promise<ReviewRecord[]> {
    let allRecords: { uri: string; cid: string; value: unknown }[] = [];
    let cursor: string | undefined = undefined;

    do {
      const response = await this.agent.com.atproto.repo.listRecords({
        repo: did,
        collection: REVIEW_COLLECTION,
        limit: 100,
        cursor: cursor,
      });

      allRecords = allRecords.concat(response.data.records);
      cursor = response.data.cursor;
    } while (cursor);

    return allRecords.map((r) => ({
      uri: r.uri,
      cid: r.cid,
      value: r.value as unknown as MusicReview,
      author: did,
    }));
  }

  private parsePostToReview(
    post: AppBskyFeedDefs.PostView,
    title: string,
    artist: string,
    currentUserDid: string,
  ) {
    if (post.author.did === currentUserDid) return null;

    const postRecord = post.record as { text?: string; createdAt?: string };
    if (!postRecord.text) return null;

    const match = postRecord.text.match(
      /^I just reviewed (.+) by (.+)!\n\nRating: (\d+(?:\.\d+)?)\/5(?:\n\n([\s\S]*))?$/,
    );
    if (!match) return null;

    const [, subjectTitle, subjectArtist, ratingStr, text] = match;

    if (
      subjectTitle.toLowerCase().trim() !== title.toLowerCase().trim() ||
      subjectArtist.toLowerCase().trim() !== artist.toLowerCase().trim()
    ) {
      return null;
    }

    return {
      uri: post.uri,
      cid: post.cid,
      author: post.author as AppBskyActorDefs.ProfileViewBasic,
      value: {
        subjectTitle,
        subjectArtist,
        rating: parseFloat(ratingStr) * 2,
        text: text || "",
        createdAt: postRecord.createdAt || new Date().toISOString(),
        listenedAt: postRecord.createdAt || new Date().toISOString(),
        postUri: post.uri,
        postCid: post.cid,
      } as MusicReview,
    };
  }

  async getOtherReviews(title: string, artist: string, currentUserDid: string) {
    if (!this.agent.session) return [];

    try {
      const response = await this.agent.app.bsky.feed.searchPosts({
        q: `"${title}" "${artist}" "I just reviewed"`,
        limit: 50,
      });

      return response.data.posts.flatMap((post) => {
        const review = this.parsePostToReview(
          post,
          title,
          artist,
          currentUserDid,
        );
        return review ? [review] : [];
      });
    } catch (err) {
      console.warn("Failed to fetch other reviews via text search", err);
      return [];
    }
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

  async deleteTastes() {
    if (!this.agent.session) {
      throw new Error(ERROR_NOT_LOGGED_IN);
    }

    try {
      await this.agent.com.atproto.repo.deleteRecord({
        repo: this.agent.session.did,
        collection: PROFILE_COLLECTION,
        rkey: "self",
      });
    } catch (err) {
      console.warn("No tastes found to delete or delete failed", err);
    }
  }

  async getPostMetrics(postUri: string) {
    if (!this.agent.session) return { likeCount: 0, viewerLike: undefined };
    try {
      const response = await this.agent.getPosts({ uris: [postUri] });
      const post = response.data.posts[0];
      if (!post) return { likeCount: 0, viewerLike: undefined };
      return {
        likeCount: post.likeCount || 0,
        viewerLike: post.viewer?.like,
      };
    } catch {
      return { likeCount: 0, viewerLike: undefined };
    }
  }

  async likePost(postUri: string, postCid: string) {
    if (!this.agent.session) throw new Error(ERROR_NOT_LOGGED_IN);
    return await this.agent.com.atproto.repo.createRecord({
      repo: this.agent.session.did,
      collection: "app.bsky.feed.like",
      record: {
        subject: { uri: postUri, cid: postCid },
        createdAt: new Date().toISOString(),
      },
    });
  }

  async unlikePost(likeUri: string) {
    if (!this.agent.session) throw new Error(ERROR_NOT_LOGGED_IN);
    const rkey = likeUri.split("/").pop() || likeUri;
    return await this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session.did,
      collection: "app.bsky.feed.like",
      rkey: rkey,
    });
  }
}

export const atApiService = new AtProtoService();
