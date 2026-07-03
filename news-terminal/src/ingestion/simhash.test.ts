import { test } from "node:test";
import assert from "node:assert/strict";
import { simhash64, hammingDistance, toSigned64, fromSigned64 } from "@/ingestion/simhash";
import { normalizeTitle, titleHash } from "@/ingestion/normalize";

test("normalizeTitle folds case, punctuation and Turkish diacritics", () => {
  assert.equal(
    normalizeTitle("BİST 100 Endeksi %2,5 Yükseldi!"),
    normalizeTitle("bist 100 endeksi 25 yukseldi")
  );
});

test("titleHash is stable for equivalent titles", () => {
  assert.equal(titleHash("Merkez Bankası faiz kararını açıkladı."), titleHash("merkez bankasi FAİZ kararını açıkladı"));
  assert.notEqual(titleHash("Merkez Bankası faiz kararını açıkladı"), titleHash("Dolar rekor kırdı"));
});

test("identical titles have simhash distance 0", () => {
  const a = simhash64("Merkez Bankası politika faizini yüzde 45'te sabit tuttu");
  const b = simhash64("Merkez Bankasi politika faizini yuzde 45te sabit tuttu!");
  assert.equal(hammingDistance(a, b), 0);
});

test("punctuation/suffix variants of the same headline stay within cluster threshold", () => {
  const base = simhash64("Merkez Bankası politika faizini yüzde 45'te sabit tuttu");
  const variant = simhash64("Merkez bankasi politika faizini yüzde 45te sabit tuttu...");
  assert.ok(hammingDistance(base, variant) <= 3, `variant distance: ${hammingDistance(base, variant)}`);
});

test("reworded story is closer than an unrelated story", () => {
  const base = simhash64("Merkez Bankası politika faizini yüzde 45'te sabit tuttu");
  const reworded = simhash64("Merkez Bankası politika faizini yüzde 45 seviyesinde sabit tuttu");
  const unrelated = simhash64("Yeni Zelda oyununun çıkış tarihi duyuruldu");
  const rewordedDist = hammingDistance(base, reworded);
  const unrelatedDist = hammingDistance(base, unrelated);
  assert.ok(rewordedDist < unrelatedDist, `reworded ${rewordedDist} vs unrelated ${unrelatedDist}`);
  assert.ok(unrelatedDist > 20, `unrelated distance too small: ${unrelatedDist}`);
});

test("signed64 round-trip preserves values with the top bit set", () => {
  const big = (1n << 63n) + 12345n;
  assert.equal(fromSigned64(toSigned64(big)), big);
  const small = 42n;
  assert.equal(fromSigned64(toSigned64(small)), small);
});
