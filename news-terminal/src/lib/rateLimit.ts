import { createClient, type RedisClientType } from "redis";

// Fixed-window counter in Redis: rl:<id>:<epoch-minute> INCR + EXPIRE.
// Simple and good enough for per-minute API tiers; fails OPEN (allows the
// request) if Redis is down so an infra blip never takes the API down.

export const TIER_LIMITS: Record<string, number> = {
  free: 60,
  pro: 600,
  internal: Number.MAX_SAFE_INTEGER, // shared-key / first-party callers
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
};

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType | null> | null = null;

async function getRedis(): Promise<RedisClientType | null> {
  if (client?.isOpen) return client;
  if (!connecting) {
    connecting = (async () => {
      try {
        const c: RedisClientType = createClient({
          url: process.env.REDIS_URL ?? "redis://localhost:6379",
          socket: {
            connectTimeout: 2000,
            // Fail fast: an API request must never hang on a Redis retry
            // loop — fail-open is the contract when Redis is down.
            reconnectStrategy: (retries) => (retries > 3 ? false : retries * 200),
          },
        });
        c.on("error", () => {}); // logged once below; don't spam per-command
        await c.connect();
        client = c;
        return c;
      } catch (err) {
        console.error("[ratelimit] redis unavailable, failing open:", (err as Error).message);
        return null;
      } finally {
        connecting = null;
      }
    })();
  }
  return connecting;
}

export function windowKey(id: string | number, nowMs = Date.now()): string {
  return `rl:${id}:${Math.floor(nowMs / 60_000)}`;
}

export async function checkRateLimit(
  id: string | number,
  limit: number
): Promise<RateLimitResult> {
  if (limit >= Number.MAX_SAFE_INTEGER) {
    return { allowed: true, limit, remaining: limit };
  }
  const redis = await getRedis();
  if (!redis) return { allowed: true, limit, remaining: limit }; // fail open

  try {
    const key = windowKey(id);
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 120);
    return { allowed: count <= limit, limit, remaining: Math.max(0, limit - count) };
  } catch (err) {
    console.error("[ratelimit] check failed, failing open:", (err as Error).message);
    return { allowed: true, limit, remaining: limit };
  }
}
