import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { hashPassword } from "@/lib/passwords";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "password_too_short", detail: "en az 8 karakter" }, { status: 400 });
  }

  const pool = getPool();
  const existing = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  // Every user gets a personal organization at signup (multi-tenancy from
  // day one — plan §"Büyük Ölçek"): API keys hang off the org, so upgrading
  // to a team later is adding members, not migrating keys.
  const org = await pool.query<{ id: number }>(
    `INSERT INTO organizations (name, slug) VALUES ($1, $2) RETURNING id`,
    [email, `org-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`]
  );
  const orgId = org.rows[0].id;
  const user = await pool.query<{ id: number }>(
    `INSERT INTO users (org_id, email, password_hash, plan_tier)
     VALUES ($1, $2, $3, 'free') RETURNING id`,
    [orgId, email, hashPassword(password)]
  );
  const userId = user.rows[0].id;
  await pool.query(
    `INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'owner')`,
    [orgId, userId]
  );

  const res = NextResponse.json({ ok: true, user: { id: userId, email } });
  res.cookies.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
