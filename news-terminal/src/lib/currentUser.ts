import type { NextRequest } from "next/server";
import { getPool } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export type CurrentUser = { id: number; email: string; orgId: number | null; planTier: string };

export async function getCurrentUser(req: NextRequest): Promise<CurrentUser | null> {
  const userId = verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const pool = getPool();
  const result = await pool.query<{ id: number; email: string; org_id: number | null; plan_tier: string }>(
    "SELECT id, email, org_id, plan_tier FROM users WHERE id = $1",
    [userId]
  );
  if (result.rows.length === 0) return null;
  const u = result.rows[0];
  return { id: u.id, email: u.email, orgId: u.org_id, planTier: u.plan_tier };
}
