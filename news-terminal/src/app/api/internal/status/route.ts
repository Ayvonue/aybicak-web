import { NextResponse } from "next/server";
import type { RedisClientType } from "redis";
import { getPool } from "@/lib/db";
import { connectRedis, NEWS_STREAM, TICKER_STREAM } from "@/lib/events";

// Sistem sağlığı: /status panelinin veri kaynağı. Her parça bağımsız
// try/catch'te — gateway ya da Redis düşükken panel yine açılır ve tam
// olarak neyin düşük olduğunu gösterir.

const GATEWAY_METRICS_URL =
  process.env.GATEWAY_METRICS_URL ?? "http://localhost:3312/metrics";

let redisClient: RedisClientType | null = null;

async function getStatusRedis(): Promise<RedisClientType | null> {
  if (redisClient?.isOpen) return redisClient;
  try {
    redisClient = await connectRedis();
    return redisClient;
  } catch {
    return null;
  }
}

export async function GET() {
  const pool = getPool();

  const [db, gateway, streams] = await Promise.all([
    (async () => {
      try {
        const totals = await pool.query<{ total: string; last_hour: string; latest: string | null }>(
          `SELECT count(*) AS total,
                  count(*) FILTER (WHERE ingested_at > now() - interval '1 hour') AS last_hour,
                  max(ingested_at)::text AS latest
           FROM news_items`
        );
        const sources = await pool.query(
          `SELECT s.name, s.active, s.poll_interval_sec,
                  s.last_polled_at,
                  EXTRACT(EPOCH FROM (now() - s.last_polled_at))::int AS seconds_since_poll,
                  count(n.id) AS item_count
           FROM sources s
           LEFT JOIN news_items n ON n.source_id = s.id
           GROUP BY s.id
           ORDER BY s.active DESC, s.name`
        );
        const tickers = await pool.query<{ fresh: string; total: string }>(
          `SELECT count(*) FILTER (WHERE p.ts > now() - interval '10 minutes') AS fresh,
                  count(*) AS total
           FROM tickers t
           LEFT JOIN LATERAL (
             SELECT ts FROM ticker_prices WHERE ticker_id = t.id ORDER BY ts DESC LIMIT 1
           ) p ON true`
        );
        return {
          ok: true,
          total_news: Number(totals.rows[0].total),
          news_last_hour: Number(totals.rows[0].last_hour),
          latest_ingested_at: totals.rows[0].latest,
          sources: sources.rows,
          tickers_fresh: Number(tickers.rows[0].fresh),
          tickers_total: Number(tickers.rows[0].total),
        };
      } catch (err) {
        return { ok: false, error: (err as Error).message };
      }
    })(),
    (async () => {
      try {
        const res = await fetch(GATEWAY_METRICS_URL, {
          cache: "no-store",
          signal: AbortSignal.timeout(1500),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { ok: true, ...(await res.json()) };
      } catch (err) {
        return { ok: false, error: (err as Error).message };
      }
    })(),
    (async () => {
      const redis = await getStatusRedis();
      if (!redis) return { ok: false as const };
      try {
        const [news, ticker] = await Promise.all([
          redis.xLen(NEWS_STREAM),
          redis.xLen(TICKER_STREAM),
        ]);
        return { ok: true as const, news_stream_len: news, ticker_stream_len: ticker };
      } catch {
        return { ok: false as const };
      }
    })(),
  ]);

  return NextResponse.json({ generated_at: new Date().toISOString(), db, gateway, streams });
}
