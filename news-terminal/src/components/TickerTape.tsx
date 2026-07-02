"use client";

import { useEffect, useRef, useState } from "react";
import type { TickerState } from "@/hooks/useTickerStream";

// Alarms are one-shot thresholds persisted in localStorage: they never expire
// on their own (differentiator #2 — no TradingView-style silent expiry) and
// are removed only when they fire or the user deletes them. Account-backed
// server-side alarms arrive with Phase 4 auth.
type Alarm = { above?: number; below?: number };
type AlarmMap = Record<string, Alarm>;

const WATCHLIST_KEY = "nt_watchlist";
const ALARMS_KEY = "nt_alarms";

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function formatPrice(price: number, currency: string): string {
  const digits = price >= 1000 ? 0 : price >= 10 ? 2 : 4;
  return `${price.toLocaleString("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} ${currency}`;
}

export function TickerTape({ tickers, live }: { tickers: Map<string, TickerState>; live: boolean }) {
  const [watchlist, setWatchlist] = useState<string[]>(() => loadJson(WATCHLIST_KEY, []));
  const [alarms, setAlarms] = useState<AlarmMap>(() => loadJson(ALARMS_KEY, {}));
  const [editing, setEditing] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const toastSeq = useRef(0);
  // Synchronous fired-guard: consecutive ticks (one per symbol) re-run the
  // alarm effect before React commits the alarm-removal state update, so the
  // stale closure would fire the same alarm twice without this.
  const firedRef = useRef(new Set<string>());

  const persistWatchlist = (next: string[]) => {
    setWatchlist(next);
    window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  };
  const persistAlarms = (next: AlarmMap) => {
    setAlarms(next);
    window.localStorage.setItem(ALARMS_KEY, JSON.stringify(next));
  };

  const pushToast = (text: string) => {
    const id = ++toastSeq.current;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 8000);
  };

  // Fire one-shot alarms on threshold crossings. Scheduled with a 0-timeout
  // so state updates happen outside the render-triggered effect body
  // (react-hooks/set-state-in-effect) instead of cascading a re-render.
  useEffect(() => {
    const timer = setTimeout(() => {
      let changed = false;
      const next: AlarmMap = { ...alarms };
      for (const [symbol, alarm] of Object.entries(alarms)) {
        const state = tickers.get(symbol);
        if (!state) continue;
        if (alarm.above !== undefined && state.price >= alarm.above) {
          const key = `${symbol}:above:${alarm.above}`;
          if (!firedRef.current.has(key)) {
            firedRef.current.add(key);
            pushToast(`🔔 ${symbol} ${alarm.above} eşiğinin üzerine çıktı (${formatPrice(state.price, state.currency)})`);
          }
          next[symbol] = { ...next[symbol], above: undefined };
          changed = true;
        }
        if (alarm.below !== undefined && state.price <= alarm.below) {
          const key = `${symbol}:below:${alarm.below}`;
          if (!firedRef.current.has(key)) {
            firedRef.current.add(key);
            pushToast(`🔔 ${symbol} ${alarm.below} eşiğinin altına indi (${formatPrice(state.price, state.currency)})`);
          }
          next[symbol] = { ...next[symbol], below: undefined };
          changed = true;
        }
      }
      if (changed) {
        for (const s of Object.keys(next)) {
          if (next[s].above === undefined && next[s].below === undefined) delete next[s];
        }
        persistAlarms(next);
      }
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickers]);

  const sorted = [...tickers.values()].sort((a, b) => {
    const aw = watchlist.includes(a.symbol) ? 0 : 1;
    const bw = watchlist.includes(b.symbol) ? 0 : 1;
    return aw - bw || a.exchange.localeCompare(b.exchange) || a.symbol.localeCompare(b.symbol);
  });

  if (sorted.length === 0) {
    return (
      <div className="tape">
        <span className="dim">
          ticker akışı bekleniyor… {live ? "" : "(gateway çevrimdışı — REST yedeği 30 sn)"}
        </span>
      </div>
    );
  }

  return (
    <div className="tape-wrap">
      <div className="tape">
        {sorted.map((t) => {
          const starred = watchlist.includes(t.symbol);
          const hasAlarm = alarms[t.symbol] !== undefined;
          return (
            <div key={t.symbol} className={`tape-item flash-${t.direction}`}>
              <button
                className={`star ${starred ? "on" : ""}`}
                title={starred ? "watchlist'ten çıkar" : "watchlist'e ekle"}
                onClick={() =>
                  persistWatchlist(
                    starred ? watchlist.filter((s) => s !== t.symbol) : [...watchlist, t.symbol]
                  )
                }
              >
                {starred ? "★" : "☆"}
              </button>
              <button
                className="tape-main"
                title={`${t.name} — alarm kur/düzenle`}
                onClick={() => setEditing(editing === t.symbol ? null : t.symbol)}
              >
                <span className="tape-symbol">
                  {t.symbol}
                  {hasAlarm && <span className="alarm-dot" title="alarm kurulu">🔔</span>}
                </span>
                <span className="tape-price">{formatPrice(t.price, t.currency)}</span>
                {t.changePct24h !== null && (
                  <span className={`tape-change ${t.changePct24h >= 0 ? "up" : "down"}`}>
                    {t.changePct24h >= 0 ? "+" : ""}
                    {t.changePct24h.toFixed(2)}%
                  </span>
                )}
                <span
                  className={`data-badge ${t.isDelayed ? "delayed" : "live"}`}
                  title={
                    t.isDelayed
                      ? `Gecikmeli veri — kaynak: ${t.dataSource}`
                      : `Canlı veri — kaynak: ${t.dataSource}`
                  }
                >
                  {t.isDelayed ? "GECİKMELİ" : "CANLI"}
                </span>
              </button>
              {editing === t.symbol && (
                <AlarmEditor
                  symbol={t.symbol}
                  current={alarms[t.symbol]}
                  onSave={(alarm) => {
                    const next = { ...alarms };
                    if (alarm.above === undefined && alarm.below === undefined) {
                      delete next[t.symbol];
                    } else {
                      next[t.symbol] = alarm;
                    }
                    // re-arming a threshold must be able to fire again
                    for (const key of firedRef.current) {
                      if (key.startsWith(`${t.symbol}:`)) firedRef.current.delete(key);
                    }
                    persistAlarms(next);
                    setEditing(null);
                  }}
                  onClose={() => setEditing(null)}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function AlarmEditor({
  symbol,
  current,
  onSave,
  onClose,
}: {
  symbol: string;
  current?: Alarm;
  onSave: (alarm: Alarm) => void;
  onClose: () => void;
}) {
  const [above, setAbove] = useState(current?.above?.toString() ?? "");
  const [below, setBelow] = useState(current?.below?.toString() ?? "");

  return (
    <div className="alarm-popover">
      <div className="alarm-title">{symbol} alarmı</div>
      <label>
        üstüne çıkınca
        <input
          type="number"
          value={above}
          onChange={(e) => setAbove(e.target.value)}
          placeholder="eşik"
        />
      </label>
      <label>
        altına inince
        <input
          type="number"
          value={below}
          onChange={(e) => setBelow(e.target.value)}
          placeholder="eşik"
        />
      </label>
      <div className="alarm-actions">
        <button
          onClick={() =>
            onSave({
              above: above === "" ? undefined : Number(above),
              below: below === "" ? undefined : Number(below),
            })
          }
        >
          kaydet
        </button>
        <button onClick={() => onSave({})}>sil</button>
        <button onClick={onClose}>kapat</button>
      </div>
      <div className="alarm-note">alarmlar süresiz saklanır, tetiklenince bir kez uyarır</div>
    </div>
  );
}
