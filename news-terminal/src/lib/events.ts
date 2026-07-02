import { createClient, type RedisClientType } from "redis";

// All news events go through ONE Redis Stream; the channel (news:finans,
// news:oyun, ... or news:all) is a field the WS gateway filters on. A single
// stream keeps last_event_id replay trivial (stream IDs are globally ordered)
// while the per-category channel abstraction stays in the client protocol —
// splitting into per-category streams is a gateway-internal change if volume
// ever demands it.
export const NEWS_STREAM = "news:events";
export const NEWS_STREAM_MAXLEN = 10_000; // replay buffer; ~a day of headlines

export type NewsEvent = {
  id: string; // news_items.id
  title: string;
  summary: string;
  url: string;
  category: string; // slug
  source_name: string;
  published_at: string; // ISO
  ingested_at: string; // ISO — for end-to-end latency measurement
  cluster_id: string;
  source_count: string; // items in the cluster ("N kaynak bildiriyor")
};

export function newsChannel(categorySlug: string): string {
  return `news:${categorySlug}`;
}

export async function connectRedis(): Promise<RedisClientType> {
  const client: RedisClientType = createClient({
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
  });
  client.on("error", (err) => console.error("[redis]", err.message));
  await client.connect();
  return client;
}

export async function publishNewsEvent(redis: RedisClientType, event: NewsEvent): Promise<void> {
  await redis.xAdd(NEWS_STREAM, "*", event as unknown as Record<string, string>, {
    TRIM: { strategy: "MAXLEN", strategyModifier: "~", threshold: NEWS_STREAM_MAXLEN },
  });
}
