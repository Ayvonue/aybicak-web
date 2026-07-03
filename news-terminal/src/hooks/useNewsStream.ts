"use client";

import { useEffect, useRef, useState } from "react";

export type StreamItem = {
  id: number;
  title: string;
  summary: string | null;
  url: string;
  category: string;
  source_name: string;
  published_at: string;
  cluster_id: number | null;
  source_count: number;
};

export type StreamStatus = "connecting" | "live" | "offline";

type WireEvent = {
  id: string;
  title: string;
  summary: string;
  url: string;
  category: string;
  source_name: string;
  published_at: string;
  cluster_id: string;
  source_count: string;
};

const MAX_ITEMS = 200;
const BACKOFF_BASE_MS = 1000;
const BACKOFF_CAP_MS = 30_000;

function toItem(e: WireEvent): StreamItem {
  return {
    id: Number(e.id),
    title: e.title,
    summary: e.summary || null,
    url: e.url,
    category: e.category,
    source_name: e.source_name,
    published_at: e.published_at,
    cluster_id: e.cluster_id ? Number(e.cluster_id) : null,
    source_count: Number(e.source_count) || 1,
  };
}

// Merge an incoming event into the list: if its cluster is already shown,
// update that row's source count in place ("N kaynak bildiriyor" ticks up)
// instead of adding a duplicate headline.
function mergeItem(items: StreamItem[], incoming: StreamItem): StreamItem[] {
  if (incoming.cluster_id !== null) {
    const idx = items.findIndex((it) => it.cluster_id === incoming.cluster_id);
    if (idx >= 0) {
      const next = [...items];
      next[idx] = { ...next[idx], source_count: Math.max(next[idx].source_count, incoming.source_count) };
      return next;
    }
  }
  return [incoming, ...items].slice(0, MAX_ITEMS);
}

export function useNewsStream(channels: string[]) {
  const [items, setItems] = useState<StreamItem[]>([]);
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const lastEventIdRef = useRef<string | null>(null);
  const channelsKey = channels.join(",");

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3312/v1/stream";
    let socket: WebSocket | null = null;
    let attempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const connect = () => {
      if (closed) return;
      setStatus("connecting");
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        attempts = 0;
        setStatus("live");
        socket?.send(
          JSON.stringify({
            type: "subscribe",
            channels: channelsKey.split(","),
            // Resume from where we left off after a reconnect — the gateway
            // replays missed entries via XRANGE, so no headline is lost.
            ...(lastEventIdRef.current ? { last_event_id: lastEventIdRef.current } : {}),
          })
        );
      };

      socket.onmessage = (msg) => {
        let data: {
          type: string;
          stream_id?: string;
          event?: WireEvent;
          events?: { stream_id: string; event: WireEvent }[];
          resumed?: boolean;
        };
        try {
          data = JSON.parse(msg.data);
        } catch {
          return;
        }
        if (data.type === "backlog" && data.events) {
          const backlogItems = data.events.map((e) => toItem(e.event));
          if (data.events.length > 0) {
            lastEventIdRef.current = data.events[data.events.length - 1].stream_id;
          }
          if (data.resumed) {
            setItems((prev) => backlogItems.reduce((acc, it) => mergeItem(acc, it), prev));
          } else {
            setItems(backlogItems.reverse()); // newest first
          }
        } else if (data.type === "event" && data.event && data.stream_id) {
          lastEventIdRef.current = data.stream_id;
          setItems((prev) => mergeItem(prev, toItem(data.event!)));
        }
      };

      socket.onclose = () => {
        if (closed) return;
        setStatus("offline");
        // Exponential backoff with jitter: 1s, 2s, 4s ... capped at 30s.
        const delay = Math.min(BACKOFF_BASE_MS * 2 ** attempts, BACKOFF_CAP_MS);
        const jitter = delay * (0.5 + Math.random() * 0.5);
        attempts++;
        reconnectTimer = setTimeout(connect, jitter);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [channelsKey]);

  return { items, status };
}
