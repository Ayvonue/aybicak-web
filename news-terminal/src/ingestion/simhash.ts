import { normalizeTitle } from "@/ingestion/normalize";

const MASK64 = (1n << 64n) - 1n;

// FNV-1a 64-bit — cheap, deterministic, no deps; good enough as the
// per-token hash feeding simhash.
function fnv1a64(str: string): bigint {
  let hash = 0xcbf29ce484222325n;
  for (let i = 0; i < str.length; i++) {
    hash ^= BigInt(str.charCodeAt(i));
    hash = (hash * 0x100000001b3n) & MASK64;
  }
  return hash;
}

// Titles are short, so tokens alone give a noisy signature; adding word
// bigrams makes near-identical headlines land within a small hamming
// distance while unrelated ones stay far apart.
function features(title: string): string[] {
  const tokens = normalizeTitle(title).split(" ").filter(Boolean);
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return [...tokens, ...bigrams];
}

export function simhash64(title: string): bigint {
  const weights = new Array<number>(64).fill(0);
  for (const feature of features(title)) {
    const h = fnv1a64(feature);
    for (let bit = 0; bit < 64; bit++) {
      weights[bit] += (h >> BigInt(bit)) & 1n ? 1 : -1;
    }
  }
  let result = 0n;
  for (let bit = 0; bit < 64; bit++) {
    if (weights[bit] > 0) result |= 1n << BigInt(bit);
  }
  return result;
}

export function hammingDistance(a: bigint, b: bigint): number {
  let x = (a ^ b) & MASK64;
  let count = 0;
  while (x) {
    x &= x - 1n;
    count++;
  }
  return count;
}

// Postgres BIGINT is signed; map the unsigned 64-bit simhash into the
// signed range for storage and back when reading.
export function toSigned64(value: bigint): string {
  return (value > (1n << 63n) - 1n ? value - (1n << 64n) : value).toString();
}

export function fromSigned64(value: string): bigint {
  const parsed = BigInt(value);
  return parsed < 0n ? parsed + (1n << 64n) : parsed;
}
