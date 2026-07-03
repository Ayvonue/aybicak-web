// Pluggable ticker source adapters (plan §"Büyük Ölçek & Genişleyebilirlik"):
// a new data vendor (e.g. a licensed BIST feed from Foreks/Matriks) is a new
// adapter + config, never a rewrite. Parsers are pure functions so they can
// be unit-tested against fixture JSON without network access.

export type TickerSeed = {
  symbol: string;
  exchange: string;
  name: string;
  currency: string;
};

export type Quote = {
  symbol: string;
  price: number;
  changePct24h: number | null;
  ts: string; // ISO — when the source says the price is from
};

export interface TickerAdapter {
  /** goes into tickers.data_source */
  name: string;
  /** true -> UI shows GECİKMELİ, false -> CANLI */
  isDelayed: boolean;
  pollIntervalSec: number;
  symbols: TickerSeed[];
  /** false when required config (API key) is missing; adapter is skipped */
  configured(): boolean;
  fetchQuotes(): Promise<Quote[]>;
}

const FETCH_TIMEOUT_MS = 10_000;

async function getJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": "news-terminal ticker worker", ...headers },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

// --- CoinGecko: crypto spot prices, no API key, ~30-60s freshness ---

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
};

export function parseCoinGecko(data: unknown, now: string): Quote[] {
  const body = data as Record<string, { usd?: number; usd_24h_change?: number }>;
  const quotes: Quote[] = [];
  for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
    const entry = body[id];
    if (!entry || typeof entry.usd !== "number") continue;
    quotes.push({
      symbol,
      price: entry.usd,
      changePct24h: typeof entry.usd_24h_change === "number" ? entry.usd_24h_change : null,
      ts: now,
    });
  }
  return quotes;
}

export const coinGeckoAdapter: TickerAdapter = {
  name: "coingecko",
  isDelayed: false,
  pollIntervalSec: 30,
  symbols: [
    { symbol: "BTC", exchange: "CRYPTO", name: "Bitcoin", currency: "USD" },
    { symbol: "ETH", exchange: "CRYPTO", name: "Ethereum", currency: "USD" },
    { symbol: "SOL", exchange: "CRYPTO", name: "Solana", currency: "USD" },
  ],
  configured: () => true,
  fetchQuotes: async () => {
    const ids = Object.values(COINGECKO_IDS).join(",");
    const data = await getJson(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    );
    return parseCoinGecko(data, new Date().toISOString());
  },
};

// --- Frankfurter: ECB daily reference FX rates. Genuinely DELAYED data
// (one fixing per business day) — drives the honest GECİKMELİ badge. ---

const FX_PAIRS: { symbol: string; base: string; quote: string }[] = [
  { symbol: "USDTRY", base: "USD", quote: "TRY" },
  { symbol: "EURTRY", base: "EUR", quote: "TRY" },
  { symbol: "EURUSD", base: "EUR", quote: "USD" },
];

export function parseFrankfurter(
  pair: { symbol: string; quote: string },
  data: unknown
): Quote | null {
  const body = data as { date?: string; rates?: Record<string, number> };
  const rate = body.rates?.[pair.quote];
  if (typeof rate !== "number" || !body.date) return null;
  return {
    symbol: pair.symbol,
    price: rate,
    changePct24h: null, // daily fixing; a 24h change would be misleading
    ts: new Date(`${body.date}T14:15:00Z`).toISOString(), // ECB fixing ~16:15 CET
  };
}

export const frankfurterAdapter: TickerAdapter = {
  name: "frankfurter-ecb",
  isDelayed: true,
  pollIntervalSec: 900, // daily data; 15min polling is already generous
  symbols: FX_PAIRS.map((p) => ({
    symbol: p.symbol,
    exchange: "FX",
    name: `${p.base}/${p.quote} (ECB günlük referans)`,
    currency: p.quote,
  })),
  configured: () => true,
  fetchQuotes: async () => {
    const quotes: Quote[] = [];
    for (const pair of FX_PAIRS) {
      const data = await getJson(
        `https://api.frankfurter.dev/v1/latest?base=${pair.base}&symbols=${pair.quote}`
      );
      const quote = parseFrankfurter(pair, data);
      if (quote) quotes.push(quote);
    }
    return quotes;
  },
};

// --- Finnhub: global equities, real-time on free tier, needs an API key.
// Inactive until FINNHUB_API_KEY is set — no code change needed to enable. ---

const FINNHUB_SYMBOLS: TickerSeed[] = [
  { symbol: "AAPL", exchange: "NASDAQ", name: "Apple Inc.", currency: "USD" },
  { symbol: "MSFT", exchange: "NASDAQ", name: "Microsoft Corp.", currency: "USD" },
  { symbol: "NVDA", exchange: "NASDAQ", name: "NVIDIA Corp.", currency: "USD" },
];

export function parseFinnhubQuote(symbol: string, data: unknown): Quote | null {
  const body = data as { c?: number; dp?: number; t?: number };
  if (typeof body.c !== "number" || body.c === 0) return null;
  return {
    symbol,
    price: body.c,
    changePct24h: typeof body.dp === "number" ? body.dp : null,
    ts: body.t ? new Date(body.t * 1000).toISOString() : new Date().toISOString(),
  };
}

export const finnhubAdapter: TickerAdapter = {
  name: "finnhub",
  isDelayed: false,
  pollIntervalSec: 15,
  symbols: FINNHUB_SYMBOLS,
  configured: () => Boolean(process.env.FINNHUB_API_KEY),
  fetchQuotes: async () => {
    const key = process.env.FINNHUB_API_KEY!;
    const quotes: Quote[] = [];
    for (const seed of FINNHUB_SYMBOLS) {
      const data = await getJson(
        `https://finnhub.io/api/v1/quote?symbol=${seed.symbol}&token=${key}`
      );
      const quote = parseFinnhubQuote(seed.symbol, data);
      if (quote) quotes.push(quote);
    }
    return quotes;
  },
};

// BIST intentionally absent: real-time BIST data requires a Borsa İstanbul
// license (via Foreks/Matriks/ForInvest etc.). When licensed, it becomes one
// more adapter here with isDelayed=false — see the plan's legal section.
export const ALL_ADAPTERS: TickerAdapter[] = [coinGeckoAdapter, frankfurterAdapter, finnhubAdapter];
