import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { isAuthorized } from "@/lib/apiAuth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { symbol } = await params;
  const pool = getPool();

  const ticker = await pool.query(
    `SELECT id, symbol, exchange, name, currency, is_delayed, data_source
     FROM tickers WHERE symbol = $1`,
    [symbol.toUpperCase()]
  );
  if (ticker.rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const t = ticker.rows[0];

  const history = await pool.query(
    `SELECT ts, price::text AS price FROM ticker_prices
     WHERE ticker_id = $1 ORDER BY ts DESC LIMIT 100`,
    [t.id]
  );

  return NextResponse.json({
    ticker: {
      symbol: t.symbol,
      exchange: t.exchange,
      name: t.name,
      currency: t.currency,
      is_delayed: t.is_delayed,
      data_source: t.data_source,
    },
    latest: history.rows[0] ?? null,
    history: history.rows,
  });
}
