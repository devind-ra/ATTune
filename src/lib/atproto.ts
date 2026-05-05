/* eslint-disable max-lines */
// AT Protocol Service
// Contains the following:
// - Interfaces for storing user data on AT Protocol
// - Functions for logging in, creating, updating and deleting reviews
// - Functions for getting user data from AT Protocol
// - Functions for getting other users' reviews

import {
  BskyAgent,
  AtpSessionData,
  AppBskyActorDefs,
  AppBskyFeedDefs,
} from "@atproto/api";

// constants used for AT Protocol record collections
export const REVIEW_COLLECTION = "app.attune.music.review";
export const PROFILE_COLLECTION = "app.attune.music.profile";
export const BSKY_POST_COLLECTION = "app.bsky.feed.post";
export const ERROR_NOT_LOGGED_IN = "Not logged in";
export const LIKE_COLLECTION = "app.bsky.feed.like";

export type AuthSession = AtpSessionData;

// interface for a music review
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

// interface for a user's tastes
export interface UserTastes {
  topArtists: string[];
  topGenres: string[];
  updatedAt: string;
}

// interface for a review record
export interface ReviewRecord {
  uri: string;
  cid: string;
  value: MusicReview;
  author?: string | AppBskyActorDefs.ProfileViewBasic;
}

// AT Protocol Service class used to interact with AT Protocol
export class AtProtoService {
  public agent: BskyAgent;
  private publicAgent: BskyAgent;

  constructor() {
    // agent used for authenticated requests and setting session data
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
    this.publicAgent = new BskyAgent({ service: "https://bsky.social" });
  }

  // login function to authenticate with AT Protocol
  async login(identifier: string, password: string) {
    await this.agent.login({ identifier, password });
    if (!this.agent.session) throw new Error("Session not created");
    return this.agent.session;
  }

  // helper function to truncate review text for Bluesky posts
  private truncateReviewText(
    text: string | undefined,
    maxLength = 200,
  ): string {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  // helper function to create a Bluesky post using .createRecord() method
  private async createBlueskyPost(
    review: Omit<MusicReview, "createdAt" | "postUri" | "postCid">,
    createdAt: string,
  ) {
    const truncatedText = this.truncateReviewText(review.text);
    const postRecord = {
      $type: BSKY_POST_COLLECTION,
      text: `I just reviewed ${review.subjectTitle} by ${review.subjectArtist}!\n\nRating: ${review.rating / 2}/5\n\n${truncatedText}`,
      createdAt,
    };

    try {
      return await this.agent.com.atproto.repo.createRecord({
        repo: this.agent.session!.did,
        collection: BSKY_POST_COLLECTION,
        record: postRecord,
      });
    } catch (err) {
      console.warn("Failed to create Bsky text post", err);
    }
  }

  // function to create a review using .createRecord() method
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

  // helper function to update a Bluesky post using .putRecord() method
  private async updateBlueskyPost(
    postUri: string,
    review: Omit<MusicReview, "createdAt" | "updatedAt">,
    createdAt: string,
  ) {
    const rkey = postUri.split("/").pop() || postUri;
    const truncatedText = this.truncateReviewText(review.text);

    try {
      await this.agent.com.atproto.repo.putRecord({
        repo: this.agent.session!.did,
        collection: BSKY_POST_COLLECTION,
        rkey,
        record: {
          $type: BSKY_POST_COLLECTION,
          text: `I just reviewed ${review.subjectTitle} by ${review.subjectArtist}!\n\nRating: ${review.rating / 2}/5\n\n${truncatedText}`,
          createdAt,
        },
      });
    } catch (err) {
      console.warn("Failed to update Bsky text post", err);
    }
  }

  // function to update a review using .putRecord() method
  async updateReview(
    uri: string,
    review: Omit<MusicReview, "createdAt" | "updatedAt">,
    createdAt: string,
  ) {
    if (!this.agent.session) {
      throw new Error(ERROR_NOT_LOGGED_IN);
    }

    if (review.postUri) {
      await this.updateBlueskyPost(review.postUri, review, createdAt);
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

  // function to delete a review using .deleteRecord() method
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

  // function to get a user's reviews using .listRecords() method
  async getReviews(did: string): Promise<ReviewRecord[]> {
    let allRecords: { uri: string; cid: string; value: unknown }[] = [];
    let cursor: string | undefined = undefined;
    const agentToUse =
      did === this.agent.session?.did ? this.agent : this.publicAgent;

    try {
      do {
        const response = await agentToUse.com.atproto.repo.listRecords({
          repo: did,
          collection: REVIEW_COLLECTION,
          limit: 100,
          cursor: cursor,
        });

        allRecords = allRecords.concat(response.data.records);
        cursor = response.data.cursor;
      } while (cursor);
    } catch (err) {
      console.warn("Could not fetch reviews for user", err);
      return [];
    }

    return allRecords.map((r) => ({
      uri: r.uri,
      cid: r.cid,
      value: r.value as unknown as MusicReview,
      author: did,
    }));
  }

  // helper function to parse a Bluesky post to a review record for companion posts
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

  // function to get other user reviews using .searchPosts() method
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

  // function to resume a session using .resumeSession() method
  async resumeSession(session: AuthSession) {
    await this.agent.resumeSession(session);
    const { data } = await this.agent.com.atproto.server.getSession();
    if (data.did !== session.did) {
      throw new Error("Session verification failed");
    }
  }

  // function to get a user's tastes using .getRecord() method from PROFILE_COLLECTION
  async getTastes(did: string) {
    const agentToUse =
      did === this.agent.session?.did ? this.agent : this.publicAgent;
    try {
      const response = await agentToUse.com.atproto.repo.getRecord({
        repo: did,
        collection: PROFILE_COLLECTION,
        rkey: "self",
      });
      return response.data.value as unknown as UserTastes;
    } catch {
      return null;
    }
  }

  // function to update a user's tastes using .putRecord() method on PROFILE_COLLECTION
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

  // function to delete a user's tastes using .deleteRecord() method on PROFILE_COLLECTION
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

  // function to get post metrics such as like count and viewer like using .getPosts() method on post URIs
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

  // function to like a post using .createRecord() method on LIKE_COLLECTION
  async likePost(postUri: string, postCid: string) {
    if (!this.agent.session) throw new Error(ERROR_NOT_LOGGED_IN);
    return await this.agent.com.atproto.repo.createRecord({
      repo: this.agent.session.did,
      collection: LIKE_COLLECTION,
      record: {
        subject: { uri: postUri, cid: postCid },
        createdAt: new Date().toISOString(),
      },
    });
  }

  // function to unlike a post using .deleteRecord() method on LIKE_COLLECTION
  async unlikePost(likeUri: string) {
    if (!this.agent.session) throw new Error(ERROR_NOT_LOGGED_IN);
    const rkey = likeUri.split("/").pop() || likeUri;
    return await this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session.did,
      collection: LIKE_COLLECTION,
      rkey: rkey,
    });
  }

  // function to search users using .searchActorsTypeahead() method
  async searchUsers(query: string) {
    try {
      const response = await this.agent.searchActorsTypeahead({
        q: query,
        limit: 10,
      });
      return response.data.actors;
    } catch (err) {
      console.warn("Failed to search users", err);
      return [];
    }
  }

  // function to follow a user using .follow() method on BskyAgent
  async followUser(did: string) {
    if (!this.agent.session) throw new Error(ERROR_NOT_LOGGED_IN);
    return await this.agent.follow(did);
  }

  // function to unfollow a user using .deleteFollow() method on BskyAgent
  async unfollowUser(followUri: string) {
    if (!this.agent.session) throw new Error(ERROR_NOT_LOGGED_IN);
    return await this.agent.deleteFollow(followUri);
  }
}

export const atApiService = new AtProtoService();
