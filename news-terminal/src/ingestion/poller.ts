import Parser from "rss-parser";
import type { RedisClientType } from "redis";
import { getPool } from "@/lib/db";
import { connectRedis, publishNewsEvent, newsChannel } from "@/lib/events";
import { SOURCE_SEEDS, type SourceSeed } from "@/ingestion/sources";
import { titleHash, stripHtml, truncateSummary } from "@/ingestion/normalize";
import { simhash64, toSigned64 } from "@/ingestion/simhash";
import {
  decideCluster,
  attachToCluster,
  loadClusterContext,
  addToContext,
  type ClusterContext,
} from "@/ingestion/cluster";

const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0 (news-terminal ingestion bot)" },
  timeout: 15000,
});

export type SourceMeta = { id: number; categoryId: number; categorySlug: string };

export async function ensureSources(): Promise<Map<string, SourceMeta>> {
  const pool = getPool();
  const categoryRows = await pool.query<{ id: number; slug: string }>(
    "SELECT id, slug FROM categories"
  );
  const categoryIdBySlug = new Map(categoryRows.rows.map((r) => [r.slug, r.id]));

  const bySourceUrl = new Map<string, SourceMeta>();
  for (const seed of SOURCE_SEEDS) {
    const categoryId = categoryIdBySlug.get(seed.categorySlug);
    if (!categoryId) throw new Error(`Unknown category slug: ${seed.categorySlug}`);

    const result = await pool.query<{ id: number }>(
      `INSERT INTO sources (name, type, url, category_id, poll_interval_sec)
       VALUES ($1, 'rss', $2, $3, $4)
       ON CONFLICT (url) DO UPDATE
         SET name = EXCLUDED.name,
             category_id = EXCLUDED.category_id,
             poll_interval_sec = EXCLUDED.poll_interval_sec
       RETURNING id`,
      [seed.name, seed.url, categoryId, seed.pollIntervalSec]
    );
    bySourceUrl.set(seed.url, {
      id: result.rows[0].id,
      categoryId,
      categorySlug: seed.categorySlug,
    });
  }
  return bySourceUrl;
}

type FeedItem = Parser.Item;

const FEED_DEADLINE_MS = 20_000;

// rss-parser'ın timeout'u yalnız soket boşta kalınca tetiklenir; veriyi damla
// damla akıtan bir sunucu döngüyü süresiz asılı bırakabilir (canlıda yaşandı).
// Sert bir toplam süre sınırı: sınır aşılırsa o kaynak bu turda atlanır.
function withDeadline<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`feed deadline (${ms}ms) exceeded`)), ms);
    timer.unref?.();
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

async function fetchFeed(seed: SourceSeed): Promise<FeedItem[] | null> {
  try {
    const feed = await withDeadline(parser.parseURL(seed.url), FEED_DEADLINE_MS);
    return feed.items;
  } catch (err) {
    console.error(`[poller] failed to fetch ${seed.name} (${seed.url}):`, (err as Error).message);
    return null;
  }
}

async function processFeedItems(
  seed: SourceSeed,
  meta: SourceMeta,
  items: FeedItem[],
  redis: RedisClientType | null,
  ctx: ClusterContext
) {
  const pool = getPool();
  let inserted = 0;
  let skipped = 0;

  // Cheap batch pre-check: on a steady-state re-poll nearly every item is
  // already stored — one indexed ANY(url) lookup replaces per-item
  // clustering work for all of them.
  const urls = items.map((it) => it.link?.trim()).filter((u): u is string => Boolean(u));
  const existing = await pool.query<{ url: string }>(
    "SELECT url FROM news_items WHERE url = ANY($1)",
    [urls]
  );
  const knownUrls = new Set(existing.rows.map((r) => r.url));

  for (const item of items) {
    const title = item.title?.trim();
    const url = item.link?.trim();
    if (!title || !url || knownUrls.has(url)) {
      skipped++;
      continue;
    }
    const summary = truncateSummary(stripHtml(item.contentSnippet || item.content));
    const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date();
    const externalId = item.guid || url;
    const hash = titleHash(title);
    const simhash = simhash64(title);

    // A single bad item must not abort the whole ingestion run.
    try {
      const decision = await decideCluster(pool, {
        titleHash: hash,
        simhash,
        sourceId: meta.id,
      }, ctx);
      if (decision.action === "skip") {
        skipped++;
        continue;
      }

      const result = await pool.query<{ id: number; ingested_at: string }>(
        `INSERT INTO news_items
           (source_id, external_id, title, summary, url, published_at, category_id, title_hash, simhash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (url) DO NOTHING
         RETURNING id, ingested_at`,
        [meta.id, externalId, title, summary, url, publishedAt, meta.categoryId, hash, toSigned64(simhash)]
      );
      if (!result.rowCount) {
        skipped++;
        continue;
      }
      inserted++;

      const row = result.rows[0];
      const { clusterId, itemCount } = await attachToCluster(pool, row.id, title, decision);
      addToContext(ctx, {
        id: row.id,
        cluster_id: clusterId,
        source_id: meta.id,
        simhash,
        title,
        title_hash: hash,
        ingested_at: new Date(row.ingested_at).getTime(),
      });

      if (redis) {
        // Best-effort: the DB is the source of truth; a Redis hiccup should
        // not fail ingestion, clients will pick the item up via REST/backlog.
        try {
          await publishNewsEvent(redis, {
            id: String(row.id),
            title,
            summary: summary ?? "",
            url,
            category: meta.categorySlug,
            source_name: seed.name,
            published_at: publishedAt.toISOString(),
            ingested_at: new Date(row.ingested_at).toISOString(),
            cluster_id: String(clusterId),
            source_count: String(itemCount),
          });
        } catch (err) {
          console.error(`[poller] redis publish failed:`, (err as Error).message);
        }
      }
    } catch (err) {
      console.error(`[poller] insert failed for "${title}" (${url}):`, (err as Error).message);
      skipped++;
    }
  }

  await pool.query("UPDATE sources SET last_polled_at = now() WHERE id = $1", [meta.id]);
  return { inserted, skipped, failed: false };
}

// Single-source poll (used by the continuous worker's per-source timers).
export async function pollSource(
  seed: SourceSeed,
  meta: SourceMeta,
  redis: RedisClientType | null,
  ctx?: ClusterContext
) {
  const items = await fetchFeed(seed);
  if (items === null) return { inserted: 0, skipped: 0, failed: true };
  const context = ctx ?? (await loadClusterContext(getPool()));
  return processFeedItems(seed, meta, items, redis, context);
}

export async function connectRedisOptional(): Promise<RedisClientType | null> {
  try {
    return await connectRedis();
  } catch (err) {
    console.error("[poller] redis unavailable, events will not be published:", (err as Error).message);
    return null;
  }
}

export async function runIngestionOnce(redis: RedisClientType | null) {
  const startedAt = Date.now();
  const sourceMap = await ensureSources();
  const summary: Record<string, { inserted: number; skipped: number; failed: boolean }> = {};

  // Fetch every feed in parallel (network dominates wall time), then process
  // sequentially against one shared cluster context.
  const feeds = await Promise.all(SOURCE_SEEDS.map((seed) => fetchFeed(seed)));
  const ctx = await loadClusterContext(getPool());

  for (let i = 0; i < SOURCE_SEEDS.length; i++) {
    const seed = SOURCE_SEEDS[i];
    const items = feeds[i];
    const meta = sourceMap.get(seed.url)!;
    const result =
      items === null
        ? { inserted: 0, skipped: 0, failed: true }
        : await processFeedItems(seed, meta, items, redis, ctx);
    summary[seed.name] = result;
    console.log(
      `[poller] ${seed.name} -> ${newsChannel(seed.categorySlug)}: +${result.inserted} new, ${result.skipped} skipped${result.failed ? " (FETCH FAILED)" : ""}`
    );
  }
  console.log(`[poller] cycle took ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
  return summary;
}

async function main() {
  const redis = await connectRedisOptional();
  const summary = await runIngestionOnce(redis);
  const totalInserted = Object.values(summary).reduce((sum, s) => sum + s.inserted, 0);
  console.log(`[poller] done. ${totalInserted} new items ingested.`);
  await redis?.quit();
  await getPool().end();
  // Deadline'ı aşıp terk edilen bir feed isteğinin sarkan soketi event
  // loop'u canlı tutabilir; tek seferlik koşu açıkça çıkar.
  process.exit(0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
