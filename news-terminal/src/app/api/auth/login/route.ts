import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { verifyPassword } from "@/lib/passwords";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const email = body.email?.trim().toLowerCase();
  if (!email || !body.password) {
    return NextResponse.json({ error: "missing_credentials" }, { status: 400 });
  }

  // Brute-force guard: 10 attempts/min per email.
  const rate = await checkRateLimit(`login:${email}`, 10);
  if (!rate.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "60" } });
  }

  const pool = getPool();
  const result = await pool.query<{ id: number; password_hash: string | null }>(
    "SELECT id, password_hash FROM users WHERE email = $1",
    [email]
  );
  const user = result.rows[0];
  if (!user?.password_hash || !verifyPassword(body.password, user.password_hash)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, user: { id: user.id, email } });
  res.cookies.set(SESSION_COOKIE, createSessionToken(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
