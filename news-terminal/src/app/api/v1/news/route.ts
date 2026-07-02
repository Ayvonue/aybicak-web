import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Phase 1 MVP auth: a single shared key via Authorization: Bearer <key>.
// Per-org API keys with tiered rate limiting land in Phase 4 (see plan
// "Public API Ürünü" — the API is the product's core positioning, not an
// afterthought, so the auth model is deliberately swappable without
// changing this route's query/response shape).
function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.NEWS_API_SHARED_KEY;
  if (!expected) return true; // no key configured -> open for local dev
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const wanted = Buffer.from(`Bearer ${expected}`);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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
    `SELECT n.id, n.title, n.summary, n.url, n.image_url, n.published_at,
            c.slug AS category, s.name AS source_name
     FROM news_items n
     JOIN categories c ON c.id = n.category_id
     JOIN sources s ON s.id = n.source_id
     ${whereClause}
     ORDER BY n.published_at DESC
     LIMIT $${params.length}`,
    params
  );

  return NextResponse.json({
    items: result.rows,
    count: result.rows.length,
  });
}
