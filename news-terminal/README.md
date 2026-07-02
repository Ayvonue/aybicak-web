# Haber Terminali (News Terminal)

Düşük gecikmeli haber terminali — borsa/trader kullanıcılar için finans haberleri,
meraklı kullanıcılar için oyun/hobi/genel haberler; kendi public API'sini de sunar.

Bu, `aybicak-web` (bıçak e-ticaret sitesi) ile **kod paylaşmayan, mantıksal olarak
bağımsız bir ürün**. Şu an aynı git deposunda yaşıyor çünkü bu oturumun yazma erişimi
bu depoyla sınırlı; ileride kendi deposuna taşınabilir (bkz. plan dosyası, "Deployment"
bölümü). Tam mimari/rekabet analizi/yol haritası için proje köküne yakın plan dosyasına
bakın: `/root/.claude/plans/bir-bilgi-terminali-yapmak-serialized-dragon.md` (bu oturuma
özel bir yol — kalıcı bir kopya isteniyorsa bu README'ye taşınabilir).

## Bu klasörde ne var (Faz 1 + Faz 2)

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

Henüz yok (sonraki fazlar — plana bakın): ticker/BIST entegrasyonu (Faz 3),
API key/tier yönetimi + billing (Faz 4), Meilisearch/AI özellikler (Faz 5).

## Yerelde çalıştırma

```bash
npm install
cp .env.example .env.local   # DATABASE_URL, NEWS_API_SHARED_KEY, REDIS_URL doldurun
npm run db:setup             # şemayı uygular (idempotent)
npm run ws:gateway           # WS gateway :3312 (Redis gerekir)
npm run ingest:watch          # sürekli ingestion worker (veya tek seferlik: npm run ingest)
npm run dev                   # http://localhost:3000/feed ve /terminal
npm test                      # normalize/simhash birim testleri
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
düştüğü, klavye navigasyonu ve kategori kısayolları gözlemlendi.
