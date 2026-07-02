import { createHash, randomBytes } from "node:crypto";

// API keys look like "nt_live_<40 hex chars>". Only the SHA-256 hash is
// stored; the prefix (first 12 chars) is kept for display in the dashboard.
// The full key is shown to the user exactly once, at creation.

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = `nt_live_${randomBytes(20).toString("hex")}`;
  return { key, prefix: key.slice(0, 12), hash: hashApiKey(key) };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
