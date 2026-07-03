"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

type SourceRow = {
  name: string;
  active: boolean;
  poll_interval_sec: number;
  last_polled_at: string | null;
  seconds_since_poll: number | null;
  item_count: string;
};

type Status = {
  generated_at: string;
  db:
    | {
        ok: true;
        total_news: number;
        news_last_hour: number;
        latest_ingested_at: string | null;
        sources: SourceRow[];
        tickers_fresh: number;
        tickers_total: number;
      }
    | { ok: false; error: string };
  gateway:
    | {
        ok: true;
        connections: number;
        events_delivered: number;
        backlog_events_served: number;
        avg_delivery_latency_ms: number | null;
        started_at: string;
      }
    | { ok: false; error: string };
  streams: { ok: boolean; news_stream_len?: number; ticker_stream_len?: number };
};

const REFRESH_MS = 10_000;

// Kaynak "geride" sayılır: son çekim, poll aralığının 3 katından eski.
function sourceHealth(s: SourceRow): "ok" | "geride" | "hiç" {
  if (s.seconds_since_poll === null) return "hiç";
  return s.seconds_since_poll > s.poll_interval_sec * 3 ? "geride" : "ok";
}

function Pill({ ok, textOk, textBad }: { ok: boolean; textOk: string; textBad: string }) {
  return <span className={`conn ${ok ? "live" : "offline"}`}>{ok ? textOk : textBad}</span>;
}

export default function StatusPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/internal/status", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          setStatus(data);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    };
    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="page status-page">
      <div className="header">
        <h1>
          Sistem <span className="accent">Durumu</span>
        </h1>
        <div className="header-right">
          <span className="status">
            {error ? "durum alınamadı" : status ? "10 sn'de bir yenilenir" : "yükleniyor…"}
          </span>
          <a className="mode-link" href="/terminal">
            terminale dön →
          </a>
          <ThemeToggle />
        </div>
      </div>

      {!status && !error && <div className="empty">Yükleniyor…</div>}

      {status && (
        <>
          <div className="status-grid">
            <div className="status-panel">
              <h3>Gerçek zamanlı katman</h3>
              <Pill ok={status.gateway.ok} textOk="GATEWAY AÇIK" textBad="GATEWAY KAPALI" />
              {status.gateway.ok && (
                <dl>
                  <div>
                    <dt>bağlı istemci</dt>
                    <dd>{status.gateway.connections}</dd>
                  </div>
                  <div>
                    <dt>iletilen event</dt>
                    <dd>{status.gateway.events_delivered.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div>
                    <dt>ort. iletim gecikmesi</dt>
                    <dd>
                      {status.gateway.avg_delivery_latency_ms === null
                        ? "—"
                        : `${Math.round(status.gateway.avg_delivery_latency_ms)} ms`}
                    </dd>
                  </div>
                  <div>
                    <dt>backlog servis edilen</dt>
                    <dd>{status.gateway.backlog_events_served.toLocaleString("tr-TR")}</dd>
                  </div>
                </dl>
              )}
            </div>

            <div className="status-panel">
              <h3>Arşiv</h3>
              <Pill ok={status.db.ok} textOk="VERİTABANI AÇIK" textBad="VERİTABANI KAPALI" />
              {status.db.ok && (
                <dl>
                  <div>
                    <dt>toplam haber</dt>
                    <dd>{status.db.total_news.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div>
                    <dt>son 1 saat</dt>
                    <dd>+{status.db.news_last_hour}</dd>
                  </div>
                  <div>
                    <dt>taze ticker</dt>
                    <dd>
                      {status.db.tickers_fresh}/{status.db.tickers_total}
                    </dd>
                  </div>
                  <div>
                    <dt>stream (haber/ticker)</dt>
                    <dd>
                      {status.streams.ok
                        ? `${status.streams.news_stream_len} / ${status.streams.ticker_stream_len}`
                        : "redis kapalı"}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </div>

          {status.db.ok && (
            <div className="status-panel sources-panel">
              <h3>Kaynaklar</h3>
              <table>
                <thead>
                  <tr>
                    <th>kaynak</th>
                    <th>haber</th>
                    <th>son çekim</th>
                    <th>durum</th>
                  </tr>
                </thead>
                <tbody>
                  {status.db.sources.map((s) => {
                    const health = sourceHealth(s);
                    return (
                      <tr key={s.name} className={s.active ? "" : "inactive"}>
                        <td>{s.name}</td>
                        <td>{s.item_count}</td>
                        <td>
                          {s.seconds_since_poll === null
                            ? "—"
                            : s.seconds_since_poll < 90
                              ? `${s.seconds_since_poll} sn önce`
                              : `${Math.round(s.seconds_since_poll / 60)} dk önce`}
                        </td>
                        <td>
                          {!s.active ? (
                            <span className="badge">pasif</span>
                          ) : (
                            <span className={`conn ${health === "ok" ? "live" : "offline"}`}>
                              {health === "ok" ? "SAĞLIKLI" : health === "geride" ? "GERİDE" : "HİÇ ÇEKİLMEDİ"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
