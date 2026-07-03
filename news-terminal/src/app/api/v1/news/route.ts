import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { authorizeApiRequest } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const auth = await authorizeApiRequest(req);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category"); // finans | oyun | hobi | genel
  const since = searchParams.get("since"); // ISO timestamp
  const limitParam = Number(searchParams.get("limit") ?? "30");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 30;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (category) {
    params.push(category);
    conditions.push(`c.slug = $${params.length}`);
  }
  if (since) {
    const sinceDate = new Date(since);
    if (!Number.isNaN(sinceDate.getTime())) {
      params.push(sinceDate.toISOString());
      conditions.push(`n.published_at > $${params.length}`);
    }
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(limit);

  const pool = getPool();
  const result = await pool.query(
    `SELECT n.id, n.title, n.summary, n.url, n.image_url, n.published_at, n.cluster_id,
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

  return NextResponse.json(
    { items: result.rows, count: result.rows.length },
    { headers: auth.rateHeaders }
  );
}
