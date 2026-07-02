# Haber Terminali (News Terminal)

Düşük gecikmeli haber terminali — borsa/trader kullanıcılar için finans haberleri,
meraklı kullanıcılar için oyun/hobi/genel haberler; kendi public API'sini de sunar.

Bu, `aybicak-web` (bıçak e-ticaret sitesi) ile **kod paylaşmayan, mantıksal olarak
bağımsız bir ürün**. Şu an aynı git deposunda yaşıyor çünkü bu oturumun yazma erişimi
bu depoyla sınırlı; ileride kendi deposuna taşınabilir (bkz. plan dosyası, "Deployment"
bölümü). Tam mimari/rekabet analizi/yol haritası için proje köküne yakın plan dosyasına
bakın: `/root/.claude/plans/bir-bilgi-terminali-yapmak-serialized-dragon.md` (bu oturuma
özel bir yol — kalıcı bir kopya isteniyorsa bu README'ye taşınabilir).

## Bu klasörde ne var (Faz 1 MVP)

- `db/schema.sql` — Postgres şeması (organizations/users en baştan, çok kiracılı büyümeye hazır)
- `src/lib/db.ts` — `pg` tabanlı bağlantı katmanı
- `src/ingestion/` — RSS ingestion: kürate kaynak listesi (`sources.ts`), normalize+dedup
  (`normalize.ts`), poller (`poller.ts`)
- `src/app/api/v1/news/route.ts` — **public API** (Bearer key ile korumalı, `NEWS_API_SHARED_KEY`)
- `src/app/api/internal/news/route.ts` — sadece `/feed` arayüzü için, auth'suz iç uç
- `src/app/feed/page.tsx` — casual kullanıcı arayüzü (kategori sekmeleri, 15sn polling ile yenileme)

Henüz yok (sonraki fazlar — plana bakın): WebSocket gerçek zamanlı katman, ticker/BIST
entegrasyonu, trader modu (`/terminal`), dedup'ın simhash clustering'e yükseltilmesi,
API key/tier yönetimi, billing.

## Yerelde çalıştırma

```bash
npm install
cp .env.example .env.local   # DATABASE_URL ve NEWS_API_SHARED_KEY'i doldurun
npm run db:setup             # şemayı uygular
npm run ingest                # RSS kaynaklarından haber çeker
npm run dev                   # http://localhost:3000/feed
```

`NEWS_API_SHARED_KEY` boş bırakılırsa `/api/v1/news` doğrulamasız çalışır (yalnızca
yerel geliştirme için).

## Doğrulama notu

Bu MVP yerel bir Postgres'e karşı uçtan uca test edildi: 6 gerçek RSS kaynağından
(Anadolu Ajansı, BBC Business, PC Gamer, GameSpot, DonanımHaber) haber çekildi,
`/api/v1/news` hem yetkisiz (401) hem yetkili isteklerle doğrulandı, `/feed` arayüzü
tarayıcıda gerçek verilerle ve kategori filtreleriyle görsel olarak doğrulandı.
