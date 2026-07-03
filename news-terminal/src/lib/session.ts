import { createHmac, timingSafeEqual } from "node:crypto";

// Stateless signed session token: "<userId>.<expiresEpochSec>.<hmac>".
// HMAC-SHA256 over the payload with SESSION_SECRET; no server-side session
// store needed for the MVP dashboard.

export const SESSION_COOKIE = "nt_session";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7; // 7 gün

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production");
  }
  return "dev-only-session-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createSessionToken(userId: number, nowMs = Date.now()): string {
  const expires = Math.floor(nowMs / 1000) + SESSION_TTL_SEC;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined, nowMs = Date.now()): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userIdStr, expiresStr, mac] = parts;
  const payload = `${userIdStr}.${expiresStr}`;
  const expected = Buffer.from(sign(payload), "hex");
  const given = Buffer.from(mac, "hex");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires * 1000 < nowMs) return null;
  const userId = Number(userIdStr);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}
