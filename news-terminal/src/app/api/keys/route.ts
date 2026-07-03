import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/currentUser";
import { generateApiKey } from "@/lib/keys";

const MAX_ACTIVE_KEYS = 5;

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const pool = getPool();
  const result = await pool.query(
    `SELECT id, prefix, tier, created_at, last_used_at, revoked_at
     FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC`,
    [user.id]
  );
  return NextResponse.json({ keys: result.rows });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const pool = getPool();
  const active = await pool.query<{ count: string }>(
    "SELECT count(*) FROM api_keys WHERE user_id = $1 AND revoked_at IS NULL",
    [user.id]
  );
  if (Number(active.rows[0].count) >= MAX_ACTIVE_KEYS) {
    return NextResponse.json(
      { error: "key_limit", detail: `en fazla ${MAX_ACTIVE_KEYS} aktif anahtar` },
      { status: 400 }
    );
  }

  const { key, prefix, hash } = generateApiKey();
  const created = await pool.query<{ id: number; created_at: string }>(
    `INSERT INTO api_keys (org_id, user_id, key_hash, prefix, tier)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
    [user.orgId, user.id, hash, prefix, user.planTier]
  );

  // The full key is returned exactly once; only its hash is stored.
  return NextResponse.json({
    key,
    id: created.rows[0].id,
    prefix,
    tier: user.planTier,
    created_at: created.rows[0].created_at,
  });
}
