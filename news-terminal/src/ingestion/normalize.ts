import { createHash } from "node:crypto";

// Phase 1 dedup: normalize + hash the title so identical/near-identical
// headlines from the same or different sources collapse to one hash.
// Phase 2 upgrades this to simhash + LSH clustering for near-duplicates
// (see plan "Farklılaştırma Stratejisi" #1 — the "N kaynak bildiriyor" badge).
export function normalizeTitle(title: string): string {
  return (
    title
      .toLocaleLowerCase("tr-TR")
      // Dotless ı is a distinct base letter (not a composed char), so NFKD
      // below won't fold it to ASCII like it does ü/ö/ç — map it explicitly,
      // otherwise "Bankası" and "Bankasi" hash differently across sources.
      .replace(/ı/g, "i")
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function titleHash(title: string): string {
  return createHash("sha1").update(normalizeTitle(title)).digest("hex");
}

export function stripHtml(html: string | undefined): string | null {
  if (!html) return null;
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateSummary(text: string | null, maxLen = 280): string | null {
  if (!text) return null;
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}
