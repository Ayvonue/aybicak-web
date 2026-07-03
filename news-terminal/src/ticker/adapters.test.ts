import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCoinGecko, parseFrankfurter, parseFinnhubQuote } from "@/ticker/adapters";

const NOW = "2026-07-02T12:00:00.000Z";

test("parseCoinGecko maps ids to symbols and keeps 24h change", () => {
  const quotes = parseCoinGecko(
    {
      bitcoin: { usd: 61790, usd_24h_change: 5.08 },
      ethereum: { usd: 1696.27, usd_24h_change: -1.2 },
    },
    NOW
  );
  assert.equal(quotes.length, 2);
  const btc = quotes.find((q) => q.symbol === "BTC")!;
  assert.equal(btc.price, 61790);
  assert.equal(btc.changePct24h, 5.08);
  assert.equal(btc.ts, NOW);
});

test("parseCoinGecko skips malformed entries", () => {
  const quotes = parseCoinGecko({ bitcoin: {}, solana: { usd: "x" } }, NOW);
  assert.equal(quotes.length, 0);
});

test("parseFrankfurter builds a daily-fixing quote without 24h change", () => {
  const quote = parseFrankfurter(
    { symbol: "USDTRY", quote: "TRY" },
    { amount: 1.0, base: "USD", date: "2026-07-01", rates: { TRY: 46.672 } }
  )!;
  assert.equal(quote.symbol, "USDTRY");
  assert.equal(quote.price, 46.672);
  assert.equal(quote.changePct24h, null);
  assert.ok(quote.ts.startsWith("2026-07-01"));
});

test("parseFrankfurter returns null when the rate is missing", () => {
  assert.equal(
    parseFrankfurter({ symbol: "USDTRY", quote: "TRY" }, { date: "2026-07-01", rates: {} }),
    null
  );
});

test("parseFinnhubQuote maps current price and daily change pct", () => {
  const quote = parseFinnhubQuote("AAPL", { c: 227.5, dp: 1.35, t: 1782950400 })!;
  assert.equal(quote.price, 227.5);
  assert.equal(quote.changePct24h, 1.35);
  assert.equal(quote.ts, new Date(1782950400 * 1000).toISOString());
});

test("parseFinnhubQuote rejects finnhub's zero-price 'unknown symbol' response", () => {
  assert.equal(parseFinnhubQuote("XXXX", { c: 0, dp: 0 }), null);
});
