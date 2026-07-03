"use client";

import { memo, useEffect, useState, type CSSProperties } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

type NewsItem = {
  id: number;
  title: string;
  summary: string | null;
  url: string;
  published_at: string;
  category: "finans" | "oyun" | "hobi" | "genel";
  source_name: string;
  source_count: number;
};

const CATEGORIES: { slug: string; label: string }[] = [
  { slug: "all", label: "Tümü" },
  { slug: "finans", label: "Finans" },
  { slug: "oyun", label: "Oyun" },
  { slug: "hobi", label: "Hobi" },
  { slug: "genel", label: "Genel" },
];

const POLL_INTERVAL_MS = 15000; // Phase 1 uses polling; the WS feed powers /terminal.

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}

// memo: 15 sn'lik her poll döngüsünde değişmeyen kartlar yeniden çizilmez.
const NewsCard = memo(function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <a
      className="card"
      href={item.url}
      target="_blank"
      rel="noreferrer"
      style={{ "--i": index } as CSSProperties}
    >
      <div className="card-meta">
        <span className={`badge ${item.category}`}>{item.category}</span>
        <span>{item.source_name}</span>
        <span>·</span>
        <span>{timeAgo(item.published_at)}</span>
        {item.source_count > 1 && (
          <span className="cluster-badge">{item.source_count} kaynak bildiriyor</span>
        )}
      </div>
      <h2>{item.title}</h2>
      {item.summary && <p>{item.summary}</p>}
    </a>
  );
});

function SkeletonCards() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <div className="skeleton" key={i} aria-hidden>
          <div className="sk-title" />
          <div className="sk-line" />
          <div className="sk-half" />
        </div>
      ))}
    </>
  );
}

export default function FeedPage() {
  const [category, setCategory] = useState("all");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // cancelled guards against a slow response for the previous category
    // overwriting the list after the user has already switched tabs.
    let cancelled = false;

    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/internal/news?category=${category}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setItems(data.items ?? []);
        setLastUpdated(new Date());
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [category]);

  return (
    <div className="page">
      <div className="header">
        <h1>
          Haber <span className="accent">Terminali</span>
        </h1>
        <div className="header-right">
          <span className="status">
            {error
              ? "bağlantı hatası — yeniden denenecek"
              : lastUpdated
                ? `son güncelleme: ${timeAgo(lastUpdated.toISOString())}`
                : "yükleniyor…"}
          </span>
          <a className="mode-link" href="/terminal">
            terminal modu →
          </a>
          <ThemeToggle />
        </div>
      </div>

      <div className="tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            className={`tab ${category === c.slug ? "active" : ""}`}
            onClick={() => {
              if (c.slug === category) return;
              setCategory(c.slug);
              setLoading(true);
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && items.length === 0 && <SkeletonCards />}
      {!loading && items.length === 0 && <div className="empty">Bu kategoride henüz haber yok.</div>}

      {items.map((item, i) => (
        <NewsCard key={item.id} item={item} index={i} />
      ))}
    </div>
  );
}
