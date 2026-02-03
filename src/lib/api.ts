import { Agent } from "@atproto/api";

export const agent = new Agent("https://public.api.bsky.app");

// You can now use it immediately for public fetches
const profile = await agent.getProfile({ actor: 'atproto.com' });