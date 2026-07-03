"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useNewsStream, type StreamItem } from "@/hooks/useNewsStream";
import { useTickerStream } from "@/hooks/useTickerStream";
import { TickerTape } from "@/components/TickerTape";
import { ThemeToggle } from "@/components/ThemeToggle";

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

// memo: her yeni WS eventi yalnız değişen satırları çizer, 200 satırlık
// listenin tamamını değil.
const NewsRow = memo(function NewsRow({
  item,
  index,
  isSelected,
  onSelect,
}: {
  item: StreamItem;
  index: number;
  isSelected: boolean;
  onSelect: (i: number) => void;
}) {
  return (
    <div
      data-row={index}
      className={`t-row ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(index)}
      onDoubleClick={() => window.open(item.url, "_blank", "noopener")}
    >
      <span className="t-time">{clock(item.published_at)}</span>
      <span className={`badge ${item.category}`}>{item.category}</span>
      <span className="t-source">{item.source_name}</span>
      <span className="t-title">{item.title}</span>
      {item.source_count > 1 && <span className="cluster-badge">{item.source_count} kaynak</span>}
    </div>
  );
});

export default function TerminalPage() {
  const { items: wsItems, status } = useNewsStream(["news:all"]);
  const { tickers, live: tickersLive } = useTickerStream();
  const [fallbackItems, setFallbackItems] = useState<StreamItem[]>([]);
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StreamItem[] | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // '/' araması: 300ms debounce ile arşivde tam metin arama; sonuç görünümü
  // canlı akışın yerine geçer, Esc/temizleme akışa döndürür.
  useEffect(() => {
    if (!query.trim()) return; // boş sorguda temizlik onChange/Esc handler'ında
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/internal/search?q=${encodeURIComponent(query)}&category=${category === "all" ? "" : category}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setSearchResults(
            (data.items ?? []).map((it: StreamItem & { cluster_id?: number | null }) => ({
              ...it,
              cluster_id: it.cluster_id ?? null,
              source_count: it.source_count ?? 1,
            }))
          );
          setSelected(0);
        }
      } catch {
        // arama başarısızsa canlı akış görünümü zaten ayakta
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, category]);

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
  const visible = useMemo(() => {
    if (searchResults !== null) return searchResults;
    return category === "all" ? items : items.filter((it) => it.category === category);
  }, [items, category, searchResults]);
  const current: StreamItem | undefined = visible[selected];

  const switchCategory = (slug: string) => {
    setCategory(slug);
    setSelected(0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape") {
          setQuery("");
          setSearchResults(null);
          (e.target as HTMLElement).blur();
        }
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
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
          <a className="mode-link" href="/status">
            durum
          </a>
          <a className="mode-link" href="/feed">
            sade görünüm →
          </a>
          <ThemeToggle />
        </div>
      </div>

      <TickerTape tickers={tickers} live={tickersLive} />

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
        <input
          ref={searchRef}
          className="t-search"
          type="search"
          placeholder="/ ara…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value.trim()) setSearchResults(null);
          }}
        />
        <span className="t-hint">j/k gezin · Enter aç · 1-5 kategori · / ara · Esc temizle</span>
      </div>

      <div className="t-body">
        <div className="t-list" ref={listRef}>
          {visible.length === 0 && (
            <div className="empty">
              {searchResults !== null ? "Sonuç bulunamadı." : "Akış bekleniyor…"}
            </div>
          )}
          {visible.map((item, i) => (
            <NewsRow
              key={item.id}
              item={item}
              index={i}
              isSelected={i === selected}
              onSelect={setSelected}
            />
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
