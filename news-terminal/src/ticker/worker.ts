import type { RedisClientType } from "redis";
import { getPool } from "@/lib/db";
import { publishTickerEvent } from "@/lib/events";
import { ALL_ADAPTERS, type TickerAdapter } from "@/ticker/adapters";
import { connectRedisOptional } from "@/ingestion/poller";

// Always-on ticker worker: each adapter polls on its own cadence, writes the
// tick to ticker_prices (archive) and publishes it to the Redis stream for
// realtime fanout. Runs as a third long-lived process next to the ingestion
// worker and the WS gateway.

export async function ensureTickers(adapter: TickerAdapter): Promise<Map<string, number>> {
  const pool = getPool();
  const idBySymbol = new Map<string, number>();
  for (const seed of adapter.symbols) {
    const result = await pool.query<{ id: number }>(
      `INSERT INTO tickers (symbol, exchange, name, currency, is_delayed, data_source)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (symbol) DO UPDATE
         SET exchange = EXCLUDED.exchange,
             name = EXCLUDED.name,
             currency = EXCLUDED.currency,
             is_delayed = EXCLUDED.is_delayed,
             data_source = EXCLUDED.data_source
       RETURNING id`,
      [seed.symbol, seed.exchange, seed.name, seed.currency, adapter.isDelayed, adapter.name]
    );
    idBySymbol.set(seed.symbol, result.rows[0].id);
  }
  return idBySymbol;
}

export async function pollAdapterOnce(
  adapter: TickerAdapter,
  idBySymbol: Map<string, number>,
  redis: RedisClientType | null
): Promise<number> {
  const pool = getPool();
  const seedBySymbol = new Map(adapter.symbols.map((s) => [s.symbol, s]));
  let stored = 0;

  const quotes = await adapter.fetchQuotes();
  for (const quote of quotes) {
    const tickerId = idBySymbol.get(quote.symbol);
    const seed = seedBySymbol.get(quote.symbol);
    if (!tickerId || !seed) continue;

    try {
      // Daily-fixing sources (FX) return the same quote_ts until the next
      // fixing; skip storing/publishing unchanged ticks.
      const inserted = await pool.query(
        `INSERT INTO ticker_prices (ticker_id, ts, price, volume, source)
         SELECT $1, $2, $3, NULL, $4
         WHERE NOT EXISTS (
           SELECT 1 FROM ticker_prices WHERE ticker_id = $1 AND ts = $2
         )
         RETURNING ticker_id`,
        [tickerId, quote.ts, quote.price, adapter.name]
      );
      if (!inserted.rowCount) continue;
      stored++;

      if (redis) {
        try {
          await publishTickerEvent(redis, {
            symbol: quote.symbol,
            exchange: seed.exchange,
            name: seed.name,
            currency: seed.currency,
            price: String(quote.price),
            change_pct_24h: quote.changePct24h === null ? "" : String(quote.changePct24h),
            quote_ts: quote.ts,
            is_delayed: adapter.isDelayed ? "1" : "0",
            data_source: adapter.name,
          });
        } catch (err) {
          console.error("[ticker] redis publish failed:", (err as Error).message);
        }
      }
    } catch (err) {
      console.error(`[ticker] store failed for ${quote.symbol}:`, (err as Error).message);
    }
  }
  return stored;
}

async function main() {
  const redis = await connectRedisOptional();
  const active = ALL_ADAPTERS.filter((a) => a.configured());
  const skipped = ALL_ADAPTERS.filter((a) => !a.configured());
  for (const a of skipped) {
    console.log(`[ticker] ${a.name} yapılandırılmamış (API anahtarı yok), atlanıyor`);
  }

  for (const adapter of active) {
    const idBySymbol = await ensureTickers(adapter);
    let running = false;
    const tick = async () => {
      if (running) return;
      running = true;
      try {
        const stored = await pollAdapterOnce(adapter, idBySymbol, redis);
        if (stored > 0) console.log(`[ticker] ${adapter.name}: ${stored} yeni fiyat`);
      } catch (err) {
        console.error(`[ticker] ${adapter.name} poll failed:`, (err as Error).message);
      } finally {
        running = false;
      }
    };
    void tick();
    setInterval(tick, adapter.pollIntervalSec * 1000);
  }
  console.log(`[ticker] worker başladı: ${active.map((a) => a.name).join(", ")}`);

  const shutdown = async () => {
    await redis?.quit();
    await getPool().end();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
