import { BskyAgent, AtpSessionData, AppBskyRichtextFacet } from "@atproto/api";

export const REVIEW_COLLECTION = "app.attune.music.review";

export type AuthSession = AtpSessionData;

export interface MusicReview {
  subjectTitle: string;
  subjectArtist: string;
  subjectUri?: string;
  rating: number;
  text?: string;
  tags?: string[];
  facets?: AppBskyRichtextFacet.Main[];
  createdAt: string;
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

  async updateReview(uri: string, review: Omit<MusicReview, "createdAt">) {
    if (!this.agent.session) {
      throw new Error("Not logged in");
    }

    const record = {
      $type: REVIEW_COLLECTION,
      createdAt: new Date().toISOString(),
      ...review,
    };

    return await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session.did,
      collection: REVIEW_COLLECTION,
      rkey: uri,
      record: record,
    });
  }

  async deleteReview(uri: string) {
    if (!this.agent.session) {
      throw new Error("Not logged in");
    }

    return await this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session.did,
      collection: REVIEW_COLLECTION,
      rkey: uri,
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

  resumeSession(session: AuthSession) {
    this.agent.resumeSession(session);
  }
}

export const atApiService = new AtProtoService();
