"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNewsStream, type StreamItem } from "@/hooks/useNewsStream";

const CATEGORIES = [
  { slug: "all", label: "Tümü", key: "1" },
  { slug: "finans", label: "Finans", key: "2" },
  { slug: "oyun", label: "Oyun", key: "3" },
  { slug: "hobi", label: "Hobi", key: "4" },
  { slug: "genel", label: "Genel", key: "5" },
];

const FALLBACK_POLL_MS = 15_000;

function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour12: false });
}

const STATUS_LABEL = {
  live: { text: "CANLI", className: "live" },
  connecting: { text: "BAĞLANIYOR", className: "connecting" },
  offline: { text: "ÇEVRİMDIŞI — REST yedeği", className: "offline" },
} as const;

export default function TerminalPage() {
  const { items: wsItems, status } = useNewsStream(["news:all"]);
  const [fallbackItems, setFallbackItems] = useState<StreamItem[]>([]);
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Progressive enhancement: if the WS gateway is unreachable, fall back to
  // REST polling so the terminal degrades to ~15s freshness instead of dying.
  useEffect(() => {
    if (status !== "offline") return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/internal/news?category=all", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setFallbackItems(
            (data.items ?? []).map((it: StreamItem & { source_count?: number }) => ({
              ...it,
              source_count: it.source_count ?? 1,
            }))
          );
        }
      } catch {
        // keep the last list; status banner already shows the outage
      }
    };
    poll();
    const interval = setInterval(poll, FALLBACK_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [status]);

  const items = wsItems.length > 0 ? wsItems : fallbackItems;
  const visible = useMemo(
    () => (category === "all" ? items : items.filter((it) => it.category === category)),
    [items, category]
  );
  const current: StreamItem | undefined = visible[selected];

  const switchCategory = (slug: string) => {
    setCategory(slug);
    setSelected(0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, Math.max(visible.length - 1, 0)));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter" || e.key === "o") {
        const item = visible[selected];
        if (item) window.open(item.url, "_blank", "noopener");
      } else {
        const cat = CATEGORIES.find((c) => c.key === e.key);
        if (cat) {
          setCategory(cat.slug);
          setSelected(0);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, selected]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-row="${selected}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const statusInfo = STATUS_LABEL[status];

  return (
    <div className="terminal">
      <div className="t-header">
        <h1>
          Haber <span className="accent">Terminali</span> <span className="dim">/ trader</span>
        </h1>
        <div className="t-header-right">
          <span className={`conn ${statusInfo.className}`}>{statusInfo.text}</span>
          <a className="mode-link" href="/feed">
            sade görünüm →
          </a>
        </div>
      </div>

      <div className="t-tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            className={`tab ${category === c.slug ? "active" : ""}`}
            onClick={() => switchCategory(c.slug)}
          >
            <span className="dim">{c.key}</span> {c.label}
          </button>
        ))}
        <span className="t-hint">j/k gezin · Enter aç · 1-5 kategori</span>
      </div>

      <div className="t-body">
        <div className="t-list" ref={listRef}>
          {visible.length === 0 && <div className="empty">Akış bekleniyor…</div>}
          {visible.map((item, i) => (
            <div
              key={item.id}
              data-row={i}
              className={`t-row ${i === selected ? "selected" : ""}`}
              onClick={() => setSelected(i)}
              onDoubleClick={() => window.open(item.url, "_blank", "noopener")}
            >
              <span className="t-time">{clock(item.published_at)}</span>
              <span className={`badge ${item.category}`}>{item.category}</span>
              <span className="t-source">{item.source_name}</span>
              <span className="t-title">{item.title}</span>
              {item.source_count > 1 && (
                <span className="cluster-badge">{item.source_count} kaynak</span>
              )}
            </div>
          ))}
        </div>
        <div className="t-detail">
          {current ? (
            <>
              <div className="card-meta">
                <span className={`badge ${current.category}`}>{current.category}</span>
                <span>{current.source_name}</span>
                <span>·</span>
                <span>{clock(current.published_at)}</span>
                {current.source_count > 1 && (
                  <span className="cluster-badge">{current.source_count} kaynak bildiriyor</span>
                )}
              </div>
              <h2>{current.title}</h2>
              {current.summary && <p>{current.summary}</p>}
              <a className="t-open" href={current.url} target="_blank" rel="noreferrer">
                kaynağa git ↗
              </a>
            </>
          ) : (
            <div className="empty">Seçili haber yok</div>
          )}
        </div>
      </div>
    </div>
  );
}
