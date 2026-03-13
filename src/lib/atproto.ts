import { BskyAgent, AtpSessionData } from "@atproto/api";

export const REVIEW_COLLECTION = "app.attune.music.review";

export type AuthSession = AtpSessionData;

export interface MusicReview {
  subjectTitle: string;
  subjectArtist: string;
  rating: number;
  text?: string;
  createdAt: string;
  updatedAt?: string;
  listenedAt: string;
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
    this.agent = new BskyAgent({ service: "https://bsky.social" });
  }

  async login(identifier: string, password: string) {
    await this.agent.login({ identifier, password });
    if (!this.agent.session) throw new Error("Session not created");
    return this.agent.session;
  }

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
}

export const atApiService = new AtProtoService();
