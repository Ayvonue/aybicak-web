import Parser from "rss-parser";
import { getPool } from "@/lib/db";
import { SOURCE_SEEDS } from "@/ingestion/sources";
import { normalizeTitle, titleHash, stripHtml, truncateSummary } from "@/ingestion/normalize";

const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0 (news-terminal ingestion bot)" },
  timeout: 15000,
});

async function ensureSources(): Promise<Map<string, { id: number; categoryId: number }>> {
  const pool = getPool();
  const categoryRows = await pool.query<{ id: number; slug: string }>(
    "SELECT id, slug FROM categories"
  );
  const categoryIdBySlug = new Map(categoryRows.rows.map((r) => [r.slug, r.id]));

  const bySourceUrl = new Map<string, { id: number; categoryId: number }>();
  for (const seed of SOURCE_SEEDS) {
    const categoryId = categoryIdBySlug.get(seed.categorySlug);
    if (!categoryId) throw new Error(`Unknown category slug: ${seed.categorySlug}`);

    const result = await pool.query<{ id: number }>(
      `INSERT INTO sources (name, type, url, category_id, poll_interval_sec)
       VALUES ($1, 'rss', $2, $3, $4)
       ON CONFLICT (url) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [seed.name, seed.url, categoryId, seed.pollIntervalSec]
    );
    bySourceUrl.set(seed.url, { id: result.rows[0].id, categoryId });
  }
  return bySourceUrl;
}

async function pollSource(seed: (typeof SOURCE_SEEDS)[number], sourceId: number, categoryId: number) {
  const pool = getPool();
  let feed: Parser.Output<Record<string, unknown>>;
  try {
    feed = await parser.parseURL(seed.url);
  } catch (err) {
    console.error(`[poller] failed to fetch ${seed.name} (${seed.url}):`, (err as Error).message);
    return { inserted: 0, skipped: 0, failed: true };
  }

  let inserted = 0;
  let skipped = 0;

  for (const item of feed.items) {
    const title = item.title?.trim();
    const url = item.link?.trim();
    if (!title || !url) {
      skipped++;
      continue;
    }
    const summary = truncateSummary(stripHtml(item.contentSnippet || item.content));
    const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date();
    const externalId = item.guid || url;
    const hash = titleHash(title);

    const result = await pool.query(
      `INSERT INTO news_items
         (source_id, external_id, title, summary, url, published_at, category_id, title_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (url) DO NOTHING
       RETURNING id`,
      [sourceId, externalId, title, summary, url, publishedAt, categoryId, hash]
    );
    if (result.rowCount && result.rowCount > 0) inserted++;
    else skipped++;
  }

  await pool.query("UPDATE sources SET last_polled_at = now() WHERE id = $1", [sourceId]);
  return { inserted, skipped, failed: false };
}

export async function runIngestionOnce() {
  const sourceMap = await ensureSources();
  const summary: Record<string, { inserted: number; skipped: number; failed: boolean }> = {};

  for (const seed of SOURCE_SEEDS) {
    const meta = sourceMap.get(seed.url)!;
    const result = await pollSource(seed, meta.id, meta.categoryId);
    summary[seed.name] = result;
    console.log(
      `[poller] ${seed.name}: +${result.inserted} new, ${result.skipped} skipped${result.failed ? " (FETCH FAILED)" : ""}`
    );
  }
  return summary;
}

async function main() {
  const summary = await runIngestionOnce();
  const totalInserted = Object.values(summary).reduce((sum, s) => sum + s.inserted, 0);
  console.log(`[poller] done. ${totalInserted} new items ingested.`);
  await getPool().end();
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
