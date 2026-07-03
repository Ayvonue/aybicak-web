# Haber Terminali (News Terminal)

Düşük gecikmeli haber terminali — borsa/trader kullanıcılar için finans haberleri,
meraklı kullanıcılar için oyun/hobi/genel haberler; kendi public API'sini de sunar.

Bu, `aybicak-web` (bıçak e-ticaret sitesi) ile **kod paylaşmayan, mantıksal olarak
bağımsız bir ürün**. Şu an aynı git deposunda yaşıyor çünkü bu oturumun yazma erişimi
bu depoyla sınırlı; ileride kendi deposuna taşınabilir (bkz. plan dosyası, "Deployment"
bölümü). Tam mimari/rekabet analizi/yol haritası için proje köküne yakın plan dosyasına
bakın: `/root/.claude/plans/bir-bilgi-terminali-yapmak-serialized-dragon.md` (bu oturuma
özel bir yol — kalıcı bir kopya isteniyorsa bu README'ye taşınabilir).

## Bu klasörde ne var (Faz 1-4)

- `db/schema.sql` — Postgres şeması (organizations/users en baştan, çok kiracılı büyümeye hazır)
- `src/lib/db.ts` — `pg` tabanlı bağlantı katmanı
- `src/lib/events.ts` — Redis Streams event yayını (tek stream, kanal alanıyla filtreleme)
- `src/ingestion/` — RSS ingestion: kürate kaynak listesi (`sources.ts`), normalize
  (`normalize.ts`, Türkçe ı-katlama dahil), simhash (`simhash.ts` + birim testleri),
  cluster atama (`cluster.ts`), tek seferlik poller (`poller.ts`), sürekli worker (`worker.ts`)
- `src/ws-gateway/server.ts` — her zaman açık WS gateway: subscribe/backlog/replay
  protokolü, `last_event_id` ile kayıpsız devam, `/metrics` + `/healthz`
- `src/hooks/useNewsStream.ts` — istemci WS hook'u (exponential backoff + jitter reconnect,
  replay, cluster bazlı satır birleştirme)
- `src/app/api/v1/news/route.ts` — **public API** (Bearer key korumalı; cluster_id +
  source_count döner)
- `src/app/api/internal/news/route.ts` — arayüzler için auth'suz iç uç (cluster başına
  tek kanonik haber)
- `src/app/feed/page.tsx` — casual görünüm (kategori sekmeleri, 15sn polling)
- `src/app/terminal/page.tsx` — **trader modu**: canlı WS akışı, CANLI/BAĞLANIYOR/ÇEVRİMDIŞI
  durum rozeti, REST polling fallback, j/k + 1-5 klavye navigasyonu, "N kaynak bildiriyor" rozeti

Faz 3 ile eklenenler:

- `src/ticker/adapters.ts` — **pluggable ticker kaynak adapter'ları**: CoinGecko
  (kripto, anahtarsız, CANLI), Frankfurter/ECB (döviz günlük referans, dürüstçe
  GECİKMELİ), Finnhub (global hisseler — `FINNHUB_API_KEY` verilince kod değişikliği
  olmadan devreye girer). Lisanslı BIST vendor'ı geldiğinde yeni bir adapter olarak eklenir.
- `src/ticker/worker.ts` — her adapter kendi kadansında fiyat çekip `ticker_prices`'a
  yazar ve `ticker:events` stream'ine yayınlar
- `src/hooks/useTickerStream.ts` + `src/components/TickerTape.tsx` — canlı fiyat
  şeridi: sembol başına **CANLI/GECİKMELİ veri rozeti** (farklılaştırıcı #3), yön
  bazlı renk flaşı, yıldızla watchlist (localStorage), **süresiz fiyat alarmları**
  (farklılaştırıcı #2 — kendiliğinden sona ermez, tetiklenince bir kez uyarır)
- `GET /api/v1/tickers`, `GET /api/v1/tickers/:symbol` (son fiyat + 100 noktalık
  tarihçe), UI fallback için `GET /api/internal/tickers`
- Gateway artık iki stream'i birden okur (haber + ticker); ticker abonelikleri
  bağlantıda sembol başına son fiyat snapshot'ı alır

Faz 4 ile eklenenler:

- **Hesap + API key yönetimi**: `/dashboard` — e-posta/parola ile kayıt-giriş (scrypt
  hash + HMAC imzalı session cookie, harici auth bağımlılığı yok), kayıtta otomatik
  kişisel organization (çok kiracılı model baştan aktif), key oluşturma (tam anahtar
  yalnızca bir kez gösterilir, DB'de SHA-256 hash saklanır), iptal, son kullanım izleme
- **Tier'lı rate limiting**: Redis sabit-pencere sayacı; free 60 istek/dk, pro 600,
  `custom_rate_limit` kolonu ile anahtar bazında özelleştirme; `X-RateLimit-*`
  başlıkları + `429`/`Retry-After`; Redis çökerse fail-open (API asla Redis yüzünden
  düşmez). Girişte e-posta başına brute-force koruması
- **OpenAPI + docs**: `/api/v1/openapi.json` (makine okunur spec) ve `/docs`
  (REST + WebSocket protokol dokümantasyonu). Eski paylaşılan key
  (`NEWS_API_SHARED_KEY`) ops/iç kullanım için geriye uyumlu çalışır

Faz 5'ten şimdilik uygulanan dilim — **tam metin arama**:

- Postgres FTS: `search_tsv` generated column + GIN indeksi ('simple' config —
  karışık TR/EN korpus için köklemesiz); Meilisearch, yazım toleransı/önek arama
  gerektiğinde bunun yerine geçer
- `GET /api/v1/search?q=&category=&limit=` — websearch sözdizimi ("dolar faiz",
  "btc OR eth", "-hisse"), ilgililik sıralaması, cluster başına tek sonuç
- Terminalde `/` kısayolu: 300ms debounce ile arşiv araması, Esc canlı akışa döner

Henüz yok (sonraki fazlar — plana bakın, dış servis/anahtar kararı gerektirir):
billing/ödeme (iyzico deseni hazır), hesap tabanlı sunucu-taraflı alarmlar,
Meilisearch, AI sentiment/etki skoru, KAP çevirisi, Timescale, lisanslı BIST verisi.

## Yerelde çalıştırma

```bash
npm install
cp .env.example .env.local   # DATABASE_URL, NEWS_API_SHARED_KEY, REDIS_URL doldurun
npm run db:setup             # şemayı uygular (idempotent)
npm run ws:gateway           # WS gateway :3312 (Redis gerekir)
npm run ingest:watch          # sürekli haber ingestion worker (tek seferlik: npm run ingest)
npm run ticker:watch          # ticker worker (CoinGecko + ECB; FINNHUB_API_KEY opsiyonel)
npm run dev                   # http://localhost:3000/feed ve /terminal
npm test                      # normalize/simhash/adapter birim testleri
```

Redis yoksa ingestion yine çalışır (event yayını atlanır) ve `/terminal` REST polling
fallback'ine düşer. `NEWS_API_SHARED_KEY` boş bırakılırsa `/api/v1/news` doğrulamasız
çalışır (yalnızca yerel geliştirme için).

## Doğrulama notu

Faz 1: 6 gerçek RSS kaynağından ingestion, API auth yolları (401/401/200) ve `/feed`
tarayıcıda doğrulandı. Faz 2: cluster pipeline'ı sentetik senaryolarla (yeni cluster /
aynı-kaynak skip / birebir başlık katılımı / simhash yakın-başlık katılımı / kanonik
sorgu) test edildi; WS gateway protokolü izole Redis DB'sinde test edildi (boş backlog,
canlı iletim, kanal filtresi, `last_event_id` replay, metrics — ort. iletim ~1ms);
tarayıcıda `/terminal` açıkken stream'e enjekte edilen event'in ~1,5 sn'de canlı
düştüğü, klavye navigasyonu ve kategori kısayolları gözlemlendi. Faz 3: adapter
parser'ları fixture'larla birim test edildi (6 test); CoinGecko + ECB'den gerçek
fiyat çekilip DB + Redis'e yazıldığı, API uçlarının (401/200/404) çalıştığı ve
tarayıcıda şerit/rozet/watchlist/alarmın canlı tikle tetiklendiği doğrulandı
(alarm tekilleştirme hatası tarayıcı testinde yakalanıp düzeltildi). Faz 4: 6 auth/key
birim testi + 16 senaryoluk e2e (kayıt/doğrulama/409, key oluşturma, key ile 200 +
rate başlıkları, geçersiz key 401, 60 istekte 429 + Retry-After, iptal sonrası 401,
çıkış/giriş, paylaşılan key geriye uyumluluğu, openapi.json) ve tarayıcıda dashboard
kayıt→key akışı doğrulandı.
