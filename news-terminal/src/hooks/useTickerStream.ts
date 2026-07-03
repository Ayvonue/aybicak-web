"use client";

import { useEffect, useRef, useState } from "react";

export type TickerState = {
  symbol: string;
  exchange: string;
  name: string;
  currency: string;
  price: number;
  changePct24h: number | null;
  quoteTs: string;
  isDelayed: boolean;
  dataSource: string;
  direction: "up" | "down" | "flat"; // vs previous tick, drives the flash
};

type WireTicker = {
  symbol: string;
  exchange: string;
  name: string;
  currency: string;
  price: string;
  change_pct_24h: string;
  quote_ts: string;
  is_delayed: string;
  data_source: string;
};

type FallbackRow = {
  symbol: string;
  exchange: string;
  name: string;
  currency: string;
  is_delayed: boolean;
  data_source: string | null;
  price: string | null;
  quote_ts: string | null;
};

const BACKOFF_BASE_MS = 1000;
const BACKOFF_CAP_MS = 30_000;
const FALLBACK_POLL_MS = 30_000;

function toState(e: WireTicker, prev?: TickerState): TickerState {
  const price = Number(e.price);
  return {
    symbol: e.symbol,
    exchange: e.exchange,
    name: e.name,
    currency: e.currency,
    price,
    changePct24h: e.change_pct_24h === "" ? null : Number(e.change_pct_24h),
    quoteTs: e.quote_ts,
    isDelayed: e.is_delayed === "1",
    dataSource: e.data_source,
    direction: !prev || prev.price === price ? "flat" : price > prev.price ? "up" : "down",
  };
}

export function useTickerStream() {
  const [tickers, setTickers] = useState<Map<string, TickerState>>(new Map());
  const [live, setLive] = useState(false);
  const liveRef = useRef(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3312/v1/stream";
    let socket: WebSocket | null = null;
    let attempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const apply = (events: WireTicker[]) => {
      setTickers((prev) => {
        const next = new Map(prev);
        for (const e of events) {
          next.set(e.symbol, toState(e, prev.get(e.symbol)));
        }
        return next;
      });
    };

    const connect = () => {
      if (closed) return;
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        attempts = 0;
        liveRef.current = true;
        setLive(true);
        socket?.send(JSON.stringify({ type: "subscribe", channels: ["ticker:all"] }));
      };

      socket.onmessage = (msg) => {
        let data: {
          type: string;
          event?: WireTicker;
          events?: { event: WireTicker }[];
        };
        try {
          data = JSON.parse(msg.data);
        } catch {
          return;
        }
        if (data.type === "ticker_snapshot" && data.events) {
          apply(data.events.map((e) => e.event));
        } else if (data.type === "ticker" && data.event) {
          apply([data.event]);
        }
      };

      socket.onclose = () => {
        if (closed) return;
        liveRef.current = false;
        setLive(false);
        const delay = Math.min(BACKOFF_BASE_MS * 2 ** attempts, BACKOFF_CAP_MS);
        attempts++;
        reconnectTimer = setTimeout(connect, delay * (0.5 + Math.random() * 0.5));
      };

      socket.onerror = () => socket?.close();
    };

    connect();

    // REST fallback: when the gateway is down, keep prices ~30s fresh.
    const fallback = setInterval(async () => {
      if (liveRef.current) return;
      try {
        const res = await fetch("/api/internal/tickers", { cache: "no-store" });
        if (!res.ok) return;
        const data: { tickers: FallbackRow[] } = await res.json();
        apply(
          data.tickers
            .filter((t) => t.price !== null)
            .map((t) => ({
              symbol: t.symbol,
              exchange: t.exchange,
              name: t.name,
              currency: t.currency,
              price: t.price!,
              change_pct_24h: "",
              quote_ts: t.quote_ts ?? new Date().toISOString(),
              is_delayed: t.is_delayed ? "1" : "0",
              data_source: t.data_source ?? "",
            }))
        );
      } catch {
        // gateway and REST both down; existing prices stay on screen
      }
    }, FALLBACK_POLL_MS);

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(fallback);
      socket?.close();
    };
  }, []);

  return { tickers, live };
}
