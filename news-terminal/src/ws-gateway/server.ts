import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { connectRedis, NEWS_STREAM, type NewsEvent } from "@/lib/events";

// Standalone always-on WS gateway (plan §"Gerçek Zamanlı İletim Tasarımı"):
// reads the Redis Stream and fans events out to subscribed clients. Stateless
// apart from in-memory subscriptions — N instances can run behind a LB, all
// reading the same stream. Replay-on-reconnect works because Redis stream IDs
// are ordered: the client sends back the last ID it saw and we XRANGE from it.

const PORT = Number(process.env.WS_PORT ?? 3312);
const BACKLOG_DEFAULT = 40; // events replayed to a fresh subscriber
const BACKLOG_RESUME_MAX = 500; // cap when resuming from last_event_id
const HEARTBEAT_MS = 30_000;

type ClientState = {
  socket: WebSocket;
  channels: Set<string>;
  alive: boolean;
};

type StreamEntry = { id: string; event: NewsEvent };

const metrics = {
  started_at: new Date().toISOString(),
  connections: 0,
  total_connections: 0,
  events_read: 0,
  events_delivered: 0,
  backlog_events_served: 0,
  delivery_latency_ms_sum: 0, // stream-entry timestamp -> socket send
  delivery_latency_ms_count: 0,
};

function channelOf(event: NewsEvent): string {
  return `news:${event.category}`;
}

function matches(channels: Set<string>, event: NewsEvent): boolean {
  return channels.has("news:all") || channels.has(channelOf(event));
}

function send(client: ClientState, payload: unknown): boolean {
  if (client.socket.readyState !== WebSocket.OPEN) return false;
  client.socket.send(JSON.stringify(payload));
  return true;
}

async function main() {
  const redis = await connectRedis(); // backlog queries
  const reader = await connectRedis(); // dedicated blocking XREAD connection

  const clients = new Set<ClientState>();

  const httpServer = createServer((req, res) => {
    if (req.url === "/healthz") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    if (req.url === "/metrics") {
      const avg =
        metrics.delivery_latency_ms_count > 0
          ? metrics.delivery_latency_ms_sum / metrics.delivery_latency_ms_count
          : null;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ...metrics, avg_delivery_latency_ms: avg }));
      return;
    }
    res.writeHead(404);
    res.end();
  });

  const wss = new WebSocketServer({ server: httpServer, path: "/v1/stream" });

  wss.on("connection", (socket) => {
    const client: ClientState = { socket, channels: new Set(), alive: true };
    clients.add(client);
    metrics.connections = clients.size;
    metrics.total_connections++;

    socket.on("pong", () => {
      client.alive = true;
    });

    socket.on("message", async (raw) => {
      let msg: { type?: string; channels?: string[]; last_event_id?: string };
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        send(client, { type: "error", error: "invalid_json" });
        return;
      }

      if (msg.type === "ping") {
        send(client, { type: "pong" });
        return;
      }

      if (msg.type === "subscribe" && Array.isArray(msg.channels)) {
        client.channels = new Set(msg.channels.filter((c) => typeof c === "string"));
        send(client, { type: "subscribed", channels: [...client.channels] });

        try {
          const backlog = await readBacklog(msg.last_event_id);
          const events = backlog.filter((e) => matches(client.channels, e.event));
          send(client, {
            type: "backlog",
            resumed: Boolean(msg.last_event_id),
            events: events.map((e) => ({ stream_id: e.id, event: e.event })),
          });
          metrics.backlog_events_served += events.length;
        } catch (err) {
          console.error("[gateway] backlog read failed:", (err as Error).message);
          send(client, { type: "error", error: "backlog_failed" });
        }
        return;
      }

      send(client, { type: "error", error: "unknown_message" });
    });

    socket.on("close", () => {
      clients.delete(client);
      metrics.connections = clients.size;
    });
  });

  async function readBacklog(lastEventId?: string): Promise<StreamEntry[]> {
    if (lastEventId) {
      // Resume: everything AFTER the client's last seen entry, oldest first.
      const entries = await redis.xRange(NEWS_STREAM, `(${lastEventId}`, "+", {
        COUNT: BACKLOG_RESUME_MAX,
      });
      return entries.map((e) => ({ id: e.id, event: e.message as unknown as NewsEvent }));
    }
    // Fresh connect: last N entries so the panel isn't blank, oldest first.
    const entries = await redis.xRevRange(NEWS_STREAM, "+", "-", { COUNT: BACKLOG_DEFAULT });
    return entries.reverse().map((e) => ({ id: e.id, event: e.message as unknown as NewsEvent }));
  }

  // Fanout loop: blocking-read new stream entries and push to subscribers.
  let lastDeliveredId = "$";
  (async () => {
    // "$" only works as "new messages" sentinel on the first read; after that
    // we track concrete IDs ourselves so nothing is lost between reads.
    const initial = await reader.xRevRange(NEWS_STREAM, "+", "-", { COUNT: 1 });
    lastDeliveredId = initial.length > 0 ? initial[0].id : "0-0";

    for (;;) {
      try {
        const result = await reader.xRead(
          { key: NEWS_STREAM, id: lastDeliveredId },
          { BLOCK: 5000, COUNT: 100 }
        );
        if (!result) continue;
        for (const stream of result) {
          for (const entry of stream.messages) {
            lastDeliveredId = entry.id;
            metrics.events_read++;
            const event = entry.message as unknown as NewsEvent;
            const entryTs = Number(entry.id.split("-")[0]);
            for (const client of clients) {
              if (matches(client.channels, event)) {
                if (send(client, { type: "event", stream_id: entry.id, event })) {
                  metrics.events_delivered++;
                  metrics.delivery_latency_ms_sum += Date.now() - entryTs;
                  metrics.delivery_latency_ms_count++;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("[gateway] stream read failed, retrying:", (err as Error).message);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  })();

  // Heartbeat: drop clients that stopped answering pings.
  setInterval(() => {
    for (const client of clients) {
      if (!client.alive) {
        client.socket.terminate();
        clients.delete(client);
        continue;
      }
      client.alive = false;
      client.socket.ping();
    }
    metrics.connections = clients.size;
  }, HEARTBEAT_MS);

  httpServer.listen(PORT, () => {
    console.log(`[gateway] listening on :${PORT} (ws path /v1/stream, http /metrics /healthz)`);
  });

  const shutdown = async () => {
    console.log("[gateway] shutting down");
    for (const client of clients) client.socket.close(1001, "server shutdown");
    httpServer.close();
    await redis.quit();
    await reader.quit();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
