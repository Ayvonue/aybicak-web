import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import { createSessionToken, verifySessionToken } from "@/lib/session";
import { generateApiKey, hashApiKey } from "@/lib/keys";
import { windowKey } from "@/lib/rateLimit";

test("password hash verifies correct password and rejects wrong one", () => {
  const stored = hashPassword("çok-gizli-parola");
  assert.ok(verifyPassword("çok-gizli-parola", stored));
  assert.ok(!verifyPassword("yanlış-parola", stored));
  assert.ok(!verifyPassword("çok-gizli-parola", "bozukformat"));
});

test("two hashes of the same password differ (per-user salt)", () => {
  assert.notEqual(hashPassword("aynı"), hashPassword("aynı"));
});

test("session token round-trips and rejects tampering", () => {
  const token = createSessionToken(42);
  assert.equal(verifySessionToken(token), 42);
  assert.equal(verifySessionToken(token.replace(/.$/, "0")), null); // mac bozuk
  assert.equal(verifySessionToken("düz-metin"), null);
  assert.equal(verifySessionToken(undefined), null);
});

test("expired session token is rejected", () => {
  const token = createSessionToken(7, Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 gün önce
  assert.equal(verifySessionToken(token), null);
});

test("api key format, one-way hash and prefix", () => {
  const { key, prefix, hash } = generateApiKey();
  assert.ok(key.startsWith("nt_live_"));
  assert.equal(prefix, key.slice(0, 12));
  assert.equal(hash, hashApiKey(key));
  assert.notEqual(generateApiKey().key, key); // benzersizlik
});

test("rate limit window key changes each minute", () => {
  const t0 = 28_333_334 * 60_000; // dakika sınırına hizalı
  assert.equal(windowKey(5, t0), windowKey(5, t0 + 59_999));
  assert.notEqual(windowKey(5, t0), windowKey(5, t0 + 60_000));
  assert.notEqual(windowKey(5, t0), windowKey(6, t0));
});
