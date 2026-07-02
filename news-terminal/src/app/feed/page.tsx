"use client";

import { useEffect, useState, useCallback } from "react";

type NewsItem = {
  id: number;
  title: string;
  summary: string | null;
  url: string;
  published_at: string;
  category: "finans" | "oyun" | "hobi" | "genel";
  source_name: string;
};

const CATEGORIES: { slug: string; label: string }[] = [
  { slug: "all", label: "Tümü" },
  { slug: "finans", label: "Finans" },
  { slug: "oyun", label: "Oyun" },
  { slug: "hobi", label: "Hobi" },
  { slug: "genel", label: "Genel" },
];

const POLL_INTERVAL_MS = 15000; // Phase 1 uses polling; Phase 2 replaces this with the WS feed.

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}

export default function FeedPage() {
  const [category, setCategory] = useState("all");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async (cat: string) => {
    const res = await fetch(`/api/internal/news?category=${cat}`, { cache: "no-store" });
    const data = await res.json();
    setItems(data.items ?? []);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchNews(category);
    const interval = setInterval(() => fetchNews(category), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [category, fetchNews]);

  return (
    <div className="page">
      <div className="header">
        <h1>
          Haber <span className="accent">Terminali</span>
        </h1>
        <div className="status">
          {lastUpdated ? `son güncelleme: ${timeAgo(lastUpdated.toISOString())}` : "yükleniyor…"}
        </div>
      </div>

      <div className="tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            className={`tab ${category === c.slug ? "active" : ""}`}
            onClick={() => setCategory(c.slug)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && items.length === 0 && <div className="empty">Yükleniyor…</div>}
      {!loading && items.length === 0 && <div className="empty">Bu kategoride henüz haber yok.</div>}

      {items.map((item) => (
        <a key={item.id} className="card" href={item.url} target="_blank" rel="noreferrer">
          <div className="card-meta">
            <span className={`badge ${item.category}`}>{item.category}</span>
            <span>{item.source_name}</span>
            <span>·</span>
            <span>{timeAgo(item.published_at)}</span>
          </div>
          <h2>{item.title}</h2>
          {item.summary && <p>{item.summary}</p>}
        </a>
      ))}
    </div>
  );
}
