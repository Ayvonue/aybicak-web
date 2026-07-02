import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

// Phase 1-3 MVP auth: a single shared key via Authorization: Bearer <key>.
// Per-org API keys with tiered rate limiting land in Phase 4 (see plan
// "Public API Ürünü") — swappable without changing route query/response shapes.
export function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.NEWS_API_SHARED_KEY;
  if (!expected) return true; // no key configured -> open for local dev
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const wanted = Buffer.from(`Bearer ${expected}`);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}
