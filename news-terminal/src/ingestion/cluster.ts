import type { Pool } from "pg";
import { hammingDistance, fromSigned64 } from "@/ingestion/simhash";

// Two headlines within this hamming distance are treated as the same story.
// 64-bit simhash over title tokens+bigrams: identical titles are 0 apart,
// reworded variants of the same event typically land ≤ 3.
const NEAR_DUPLICATE_THRESHOLD = 3;
const EXACT_WINDOW_MS = 48 * 60 * 60 * 1000;
const NEAR_WINDOW_MS = 6 * 60 * 60 * 1000;

export type ClusterDecision =
  | { action: "skip" } // exact duplicate from the same source (re-published item)
  | { action: "join"; clusterId: number } // same story already reported by another source
  | { action: "new" }; // first report of this story

export type ClusterCandidate = {
  id: number;
  cluster_id: number | null;
  source_id: number;
  simhash: bigint | null;
  title: string;
  title_hash: string;
  ingested_at: number; // epoch ms
};

// In-memory candidate window, loaded ONCE per ingestion cycle instead of
// querying per feed item (the per-item 1000-row scan dominated poll time).
// Newly inserted items are appended so later items in the same cycle can
// cluster against them.
export type ClusterContext = {
  byTitleHash: Map<string, ClusterCandidate[]>;
  recent: ClusterCandidate[];
};

export async function loadClusterContext(pool: Pool): Promise<ClusterContext> {
  const result = await pool.query<{
    id: number;
    cluster_id: number | null;
    source_id: number;
    simhash: string | null;
    title: string;
    title_hash: string;
    ingested_at: string;
  }>(
    `SELECT id, cluster_id, source_id, simhash, title, title_hash, ingested_at
     FROM news_items
     WHERE ingested_at > now() - interval '48 hours'`
  );
  const ctx: ClusterContext = { byTitleHash: new Map(), recent: [] };
  for (const row of result.rows) {
    addToContext(ctx, {
      id: row.id,
      cluster_id: row.cluster_id,
      source_id: row.source_id,
      simhash: row.simhash === null ? null : fromSigned64(row.simhash),
      title: row.title,
      title_hash: row.title_hash,
      ingested_at: new Date(row.ingested_at).getTime(),
    });
  }
  return ctx;
}

export function addToContext(ctx: ClusterContext, candidate: ClusterCandidate): void {
  const list = ctx.byTitleHash.get(candidate.title_hash);
  if (list) list.push(candidate);
  else ctx.byTitleHash.set(candidate.title_hash, [candidate]);
  ctx.recent.push(candidate);
}

// A matched row ingested before clustering existed has cluster_id NULL;
// retrofit a cluster around it so the incoming item has something to join.
async function ensureClusterForItem(pool: Pool, row: ClusterCandidate): Promise<number> {
  if (row.cluster_id !== null) return row.cluster_id;
  const created = await pool.query<{ id: number }>(
    `INSERT INTO clusters (canonical_item_id, canonical_title) VALUES ($1, $2) RETURNING id`,
    [row.id, row.title]
  );
  const clusterId = created.rows[0].id;
  await pool.query("UPDATE news_items SET cluster_id = $1 WHERE id = $2", [clusterId, row.id]);
  row.cluster_id = clusterId;
  return clusterId;
}

export async function decideCluster(
  pool: Pool,
  input: { titleHash: string; simhash: bigint; sourceId: number },
  ctx: ClusterContext,
  nowMs = Date.now()
): Promise<ClusterDecision> {
  const exactMatches = (ctx.byTitleHash.get(input.titleHash) ?? []).filter(
    (c) => nowMs - c.ingested_at < EXACT_WINDOW_MS
  );
  if (exactMatches.length > 0) {
    if (exactMatches.some((c) => c.source_id === input.sourceId)) {
      return { action: "skip" };
    }
    return { action: "join", clusterId: await ensureClusterForItem(pool, exactMatches[0]) };
  }

  let best: { row: ClusterCandidate; distance: number } | null = null;
  for (const row of ctx.recent) {
    if (row.simhash === null || nowMs - row.ingested_at > NEAR_WINDOW_MS) continue;
    const distance = hammingDistance(input.simhash, row.simhash);
    if (distance <= NEAR_DUPLICATE_THRESHOLD && (!best || distance < best.distance)) {
      best = { row, distance };
    }
  }
  if (best) {
    if (best.row.source_id === input.sourceId && best.distance === 0) {
      return { action: "skip" };
    }
    return { action: "join", clusterId: await ensureClusterForItem(pool, best.row) };
  }

  return { action: "new" };
}

// Called after the item row exists; links it to its cluster and returns the
// cluster id + how many sources are now reporting the story (for the badge
// and the realtime event payload).
export async function attachToCluster(
  pool: Pool,
  itemId: number,
  title: string,
  decision: Exclude<ClusterDecision, { action: "skip" }>
): Promise<{ clusterId: number; itemCount: number }> {
  if (decision.action === "join") {
    await pool.query("UPDATE news_items SET cluster_id = $1 WHERE id = $2", [
      decision.clusterId,
      itemId,
    ]);
    const updated = await pool.query<{ item_count: number }>(
      `UPDATE clusters SET item_count = item_count + 1, last_seen_at = now()
       WHERE id = $1 RETURNING item_count`,
      [decision.clusterId]
    );
    return { clusterId: decision.clusterId, itemCount: updated.rows[0].item_count };
  }

  const created = await pool.query<{ id: number }>(
    `INSERT INTO clusters (canonical_item_id, canonical_title) VALUES ($1, $2) RETURNING id`,
    [itemId, title]
  );
  const clusterId = created.rows[0].id;
  await pool.query("UPDATE news_items SET cluster_id = $1 WHERE id = $2", [clusterId, itemId]);
  return { clusterId, itemCount: 1 };
}
