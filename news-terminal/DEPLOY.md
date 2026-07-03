# Deploy Rehberi

Mimarinin deploy ayrımı (plandaki kritik karar): **stateless** parçalar
serverless'a, **her zaman açık** parçalar kalıcı bir host'a gider.

| Bileşen | Nereye | Neden |
|---|---|---|
| Next.js web (feed/terminal/dashboard/docs + REST) | Vercel | Stateless, istekle çalışır |
| WS gateway | Fly.io / Railway / VPS | Kalıcı WebSocket bağlantıları |
| Ingestion + ticker worker'ları | Fly.io / Railway / VPS | Sürekli polling döngüleri |
| Postgres | Neon | Zaten kullanılan yönetilen servis |
| Redis | Upstash / Fly Redis / VPS'te compose | Streams + rate limit sayaçları |

## Ortam değişkenleri

| Değişken | Kim kullanır | Not |
|---|---|---|
| `DATABASE_URL` | hepsi | Neon bağlantı dizesi |
| `REDIS_URL` | gateway, worker'lar, web (rate limit) | `rediss://` TLS destekli |
| `SESSION_SECRET` | web | **prod'da zorunlu**, uzun rastgele değer |
| `NEWS_API_SHARED_KEY` | web | opsiyonel iç/ops anahtarı |
| `FINNHUB_API_KEY` | ticker worker | verilirse hisse adapter'ı açılır |
| `NEXT_PUBLIC_WS_URL` | web (build-time) | örn. `wss://ws.alanadi.com/v1/stream` |
| `NEXT_PUBLIC_SITE_URL` | web | kanonik URL (sitemap/OG) |
| `GATEWAY_METRICS_URL` | web (/status) | gateway'in iç adresi |
| `WS_PORT` | gateway | varsayılan 3312 |

## Seçenek A — Vercel + Fly.io (önerilen başlangıç)

1. **Web:** repoyu Vercel'e bağla, kök dizini `news-terminal/` seç,
   env değişkenlerini gir. Bitti.
2. **Her zaman açık katman:**
   ```bash
   cp fly.toml.example fly.toml   # app adını ve bölgeyi düzenle
   fly launch --no-deploy
   fly secrets set DATABASE_URL=... REDIS_URL=... SESSION_SECRET=...
   fly deploy
   fly scale count gateway=1 ingest=1 ticker=1
   ```
3. DNS: `ws.alanadi.com` → Fly uygulaması; `NEXT_PUBLIC_WS_URL`'i buna
   göre Vercel'de ayarla ve yeniden deploy et.

## Seçenek B — Tek VPS (tam self-host)

```bash
export SESSION_SECRET=$(openssl rand -hex 32)
export POSTGRES_PASSWORD=$(openssl rand -hex 16)
docker compose up -d --build
```

- Web: :3000, WS gateway: :3312 — önlerine TLS için Caddy/Nginx koyun.
- İlk açılışta şema otomatik uygulanır (`db/schema.sql` init script).
- Ölçek: `docker compose up -d --scale gateway=2` (gateway stateless,
  LB arkasında çoğaltılabilir; bkz. plan §Gerçek Zamanlı İletim).

## Doğrulama kontrol listesi

- `GET /healthz` (gateway) → `{"ok":true}`
- `GET /status` (web) → gateway AÇIK, kaynaklar SAĞLIKLI
- `/terminal` → CANLI rozeti yeşil, ticker şeridi akıyor
- `wscat -c wss://.../v1/stream` → subscribe/backlog protokolü yanıtlıyor

> Not: Bu dosyadaki Docker/Fly konfigürasyonları bu geliştirme ortamında
> docker daemon bulunmadığından imaj derlenerek test edilmedi; compose
> dosyası sözdizimsel olarak doğrulandı. İlk gerçek deploy'da yukarıdaki
> kontrol listesini izleyin.
