import type { Pool } from "pg";
import { hammingDistance, fromSigned64 } from "@/ingestion/simhash";

// Two headlines within this hamming distance are treated as the same story.
// 64-bit simhash over title tokens+bigrams: identical titles are 0 apart,
// reworded variants of the same event typically land ≤ 3.
const NEAR_DUPLICATE_THRESHOLD = 3;
const EXACT_WINDOW = "48 hours";
const NEAR_WINDOW = "6 hours";
const NEAR_SCAN_LIMIT = 1000;

export type ClusterDecision =
  | { action: "skip" } // exact duplicate from the same source (re-published item)
  | { action: "join"; clusterId: number } // same story already reported by another source
  | { action: "new" }; // first report of this story

type CandidateRow = {
  id: number;
  cluster_id: number | null;
  source_id: number;
  simhash: string | null;
  title: string;
};

// A matched row ingested before clustering existed has cluster_id NULL;
// retrofit a cluster around it so the incoming item has something to join.
async function ensureClusterForItem(pool: Pool, row: CandidateRow): Promise<number> {
  if (row.cluster_id !== null) return row.cluster_id;
  const created = await pool.query<{ id: number }>(
    `INSERT INTO clusters (canonical_item_id, canonical_title) VALUES ($1, $2) RETURNING id`,
    [row.id, row.title]
  );
  const clusterId = created.rows[0].id;
  await pool.query("UPDATE news_items SET cluster_id = $1 WHERE id = $2", [clusterId, row.id]);
  return clusterId;
}

export async function decideCluster(
  pool: Pool,
  input: { titleHash: string; simhash: bigint; sourceId: number }
): Promise<ClusterDecision> {
  const exact = await pool.query<CandidateRow>(
    `SELECT id, cluster_id, source_id, simhash, title FROM news_items
     WHERE title_hash = $1 AND ingested_at > now() - interval '${EXACT_WINDOW}'
     ORDER BY ingested_at ASC
     LIMIT 20`,
    [input.titleHash]
  );
  if (exact.rows.length > 0) {
    if (exact.rows.some((r) => r.source_id === input.sourceId)) {
      return { action: "skip" };
    }
    return { action: "join", clusterId: await ensureClusterForItem(pool, exact.rows[0]) };
  }

  const recent = await pool.query<CandidateRow>(
    `SELECT id, cluster_id, source_id, simhash, title FROM news_items
     WHERE simhash IS NOT NULL AND ingested_at > now() - interval '${NEAR_WINDOW}'
     ORDER BY ingested_at DESC
     LIMIT ${NEAR_SCAN_LIMIT}`
  );
  let best: { row: CandidateRow; distance: number } | null = null;
  for (const row of recent.rows) {
    const distance = hammingDistance(input.simhash, fromSigned64(row.simhash!));
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
