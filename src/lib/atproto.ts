import { BskyAgent, AtpSessionData } from '@atproto/api';

export const REVIEW_COLLECTION = 'app.attune.music.review';

export type AuthSession = AtpSessionData;

export interface MusicReview {
    subjectTitle: string;
    subjectArtist: string;
    subjectUri?: string;
    rating: number;
    text?: string;
    createdAt: string;
}

export class AtProtoService {
    public agent: BskyAgent;

    constructor() {
        this.agent = new BskyAgent({ service: 'https://bsky.social' });
    }

    async login(identifier: string, password: string) {
        const response = await this.agent.login({ identifier, password });
        return response.data;
    }

    async createReview(review: Omit<MusicReview, 'createdAt'>) {
        if (!this.agent.session) {
            throw new Error('Not logged in');
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
        }));
    }

    resumeSession(session: AuthSession) {
        this.agent.resumeSession(session);
    }
}

export const atApiService = new AtProtoService();
