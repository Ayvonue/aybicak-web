import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { hashApiKey } from "@/lib/keys";
import { checkRateLimit, TIER_LIMITS } from "@/lib/rateLimit";

// Phase 4 API auth: Bearer <key> is looked up (hashed) in api_keys and rate
// limited per key by tier. The legacy single shared key (NEWS_API_SHARED_KEY)
// still works as an ops/internal escape hatch with no rate limit.

export type ApiAuthOk = {
  ok: true;
  keyId: number | null; // null for the shared key
  tier: string;
  rateHeaders: Record<string, string>;
};
export type ApiAuthFail = { ok: false; response: NextResponse };

function matchesSharedKey(header: string | null): boolean {
  const expected = process.env.NEWS_API_SHARED_KEY;
  if (!expected || !header) return false;
  const given = Buffer.from(header);
  const wanted = Buffer.from(`Bearer ${expected}`);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

export async function authorizeApiRequest(req: NextRequest): Promise<ApiAuthOk | ApiAuthFail> {
  const header = req.headers.get("authorization");

  // Local dev with nothing configured: stay open.
  if (!process.env.NEWS_API_SHARED_KEY && !header) {
    return { ok: true, keyId: null, tier: "internal", rateHeaders: {} };
  }

  if (matchesSharedKey(header)) {
    return { ok: true, keyId: null, tier: "internal", rateHeaders: {} };
  }

  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!bearer || !bearer.startsWith("nt_")) {
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }

  const pool = getPool();
  const result = await pool.query<{ id: number; tier: string; custom_rate_limit: number | null }>(
    `SELECT id, tier, custom_rate_limit FROM api_keys
     WHERE key_hash = $1 AND revoked_at IS NULL`,
    [hashApiKey(bearer)]
  );
  if (result.rows.length === 0) {
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
  const key = result.rows[0];
  const limit = key.custom_rate_limit ?? TIER_LIMITS[key.tier] ?? TIER_LIMITS.free;

  const rate = await checkRateLimit(key.id, limit);
  const rateHeaders = {
    "X-RateLimit-Limit": String(rate.limit),
    "X-RateLimit-Remaining": String(rate.remaining),
  };
  if (!rate.allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "rate_limited", detail: "dakikalık istek limitiniz doldu" },
        { status: 429, headers: { ...rateHeaders, "Retry-After": "60" } }
      ),
    };
  }

  // Throttled usage stamp — at most one write per key per minute.
  void pool
    .query(
      `UPDATE api_keys SET last_used_at = now()
       WHERE id = $1 AND (last_used_at IS NULL OR last_used_at < now() - interval '60 seconds')`,
      [key.id]
    )
    .catch(() => {});

  return { ok: true, keyId: key.id, tier: key.tier, rateHeaders };
}

// Backwards-compatible boolean check used by earlier phases; now also
// accepts DB-issued keys. Prefer authorizeApiRequest in route handlers.
export function isAuthorized(req: NextRequest): boolean {
  return matchesSharedKey(req.headers.get("authorization")) || !process.env.NEWS_API_SHARED_KEY;
}
