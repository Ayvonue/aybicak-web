import { getPool } from "@/lib/db";

export type TickerRow = {
  symbol: string;
  exchange: string;
  name: string;
  currency: string;
  is_delayed: boolean;
  data_source: string | null;
  price: string | null;
  quote_ts: string | null;
};

// Latest price per ticker; shared by the public and internal routes.
export async function listTickersWithLatest(): Promise<TickerRow[]> {
  const pool = getPool();
  const result = await pool.query<TickerRow>(
    `SELECT t.symbol, t.exchange, t.name, t.currency, t.is_delayed, t.data_source,
            p.price::text AS price, p.ts AS quote_ts
     FROM tickers t
     LEFT JOIN LATERAL (
       SELECT price, ts FROM ticker_prices
       WHERE ticker_id = t.id ORDER BY ts DESC LIMIT 1
     ) p ON true
     ORDER BY t.exchange, t.symbol`
  );
  return result.rows;
}
