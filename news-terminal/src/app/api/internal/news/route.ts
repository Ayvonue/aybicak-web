import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// First-party endpoint for the /feed and /terminal UIs only — no API key
// required since it never leaves our own frontend. The documented public
// product surface is /api/v1/news (see that route for the real auth model).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const limit = 40;

  const pool = getPool();
  const params: unknown[] = [];
  let whereClause = "";
  if (category && category !== "all") {
    params.push(category);
    whereClause = `WHERE c.slug = $1`;
  }
  params.push(limit);

  // One row per story: the cluster's canonical (first) report represents the
  // whole cluster, source_count powers the "N kaynak bildiriyor" badge.
  // cluster_id IS NULL covers rows ingested before clustering existed.
  const result = await pool.query(
    `SELECT n.id, n.title, n.summary, n.url, n.published_at, n.cluster_id,
            c.slug AS category, s.name AS source_name,
            COALESCE(cl.item_count, 1) AS source_count
     FROM news_items n
     JOIN categories c ON c.id = n.category_id
     JOIN sources s ON s.id = n.source_id
     LEFT JOIN clusters cl ON cl.id = n.cluster_id
     ${whereClause ? `${whereClause} AND` : "WHERE"} (n.cluster_id IS NULL OR cl.canonical_item_id = n.id)
     ORDER BY n.published_at DESC
     LIMIT $${params.length}`,
    params
  );

  return NextResponse.json({ items: result.rows });
}
