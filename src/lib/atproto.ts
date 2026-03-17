import { BskyAgent, AtpSessionData } from "@atproto/api";

// AT protocol integration functions

// URLs for collections of reviews and user profiles
export const REVIEW_COLLECTION = "app.attune.music.review";
export const PROFILE_COLLECTION = "app.attune.music.profile";

// Type for AT protocol session
export type AuthSession = AtpSessionData;

// AT protocol interfaces

// AT protocol Music Review interface
export interface MusicReview {
  subjectTitle: string;
  subjectArtist: string;
  rating: number;
  text?: string;
  createdAt: string;
  updatedAt?: string;
  listenedAt: string;
}

// AT protocol User Tastes interface
export interface UserTastes {
  topArtists: string[];
  topGenres: string[];
  updatedAt: string;
}

// AT protocol Review Record interface
export interface ReviewRecord {
  uri: string;
  cid: string;
  value: MusicReview;
  author?: string;
}

// AT protocol service class
export class AtProtoService {
  public agent: BskyAgent;

  // Constructor for AT protocol service
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

  // Login function for AT protocol
  async login(identifier: string, password: string) {
    await this.agent.login({ identifier, password });
    if (!this.agent.session) throw new Error("Session not created");
    return this.agent.session;
  }

  // Create review function for AT protocol
  async createReview(review: Omit<MusicReview, "createdAt">) {
    if (!this.agent.session) {
      throw new Error("Not logged in");
    }

    const record = {
      $type: REVIEW_COLLECTION,
      createdAt: new Date().toISOString(),
      ...review,
    };

    return await this.agent.com.atproto.repo.createRecord({
      repo: this.agent.session.did,
      collection: REVIEW_COLLECTION,
      record: record,
    });
  }

  // Update review function for AT protocol
  async updateReview(
    uri: string,
    review: Omit<MusicReview, "createdAt" | "updatedAt">,
    createdAt: string,
  ) {
    if (!this.agent.session) {
      throw new Error("Not logged in");
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

  // Delete review function for AT protocol
  async deleteReview(uri: string) {
    if (!this.agent.session) {
      throw new Error("Not logged in");
    }

    const rkey = uri.split("/").pop() || uri;

    return await this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session.did,
      collection: REVIEW_COLLECTION,
      rkey: rkey,
    });
  }

  // async getReviewByRKey(did: string, rkey: string) : Promise<ReviewRecord> {
  //     const response = await this.agent.com.atproto.repo.getRecord({
  //         repo: did,
  //         collection: REVIEW_COLLECTION,
  //         rkey: rkey,
  //     });

  //     return {
  //         uri: response.data.uri,
  //         cid: response.data.cid,
  //         value: response.data.value as unknown as MusicReview,
  //         author: did,
  //     }
  // }

  // Retrieve reviews function for AT protocol
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

  // Resume session function for AT protocol
  async resumeSession(session: AuthSession) {
    await this.agent.resumeSession(session);
    const { data } = await this.agent.com.atproto.server.getSession();
    if (data.did !== session.did) {
      throw new Error("Session verification failed");
    }
  }

  // Retrieve user tastes function for AT protocol
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

  // Update user tastes function for AT protocol
  async updateTastes(tastes: Omit<UserTastes, "updatedAt">) {
    if (!this.agent.session) {
      throw new Error("Not logged in");
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
