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

  const result = await pool.query(
    `SELECT n.id, n.title, n.summary, n.url, n.published_at,
            c.slug AS category, s.name AS source_name
     FROM news_items n
     JOIN categories c ON c.id = n.category_id
     JOIN sources s ON s.id = n.source_id
     ${whereClause}
     ORDER BY n.published_at DESC
     LIMIT $${params.length}`,
    params
  );

  return NextResponse.json({ items: result.rows });
}
