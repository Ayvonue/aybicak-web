# Ay Bıçak — E-Ticaret Sitesi

El yapımı premium bıçaklar için Next.js 16 (App Router) ile geliştirilmiş e-ticaret sitesi.

## Teknolojiler

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS 4** — stil
- **Framer Motion** + **Lenis** — animasyon ve yumuşak kaydırma
- **Resend** — üyelik doğrulama e-postaları

## Kurulum

```bash
npm install
cp .env.example .env.local   # değerleri doldurun
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresinden siteye erişebilirsiniz.

## Ortam Değişkenleri

`.env.example` dosyasındaki tüm değişkenlerin açıklamaları kendi içindedir. Özetle:

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `RESEND_API_KEY` | Üyelik için | Doğrulama e-postaları (yoksa kayıt akışı çalışmaz) |
| `EMAIL_FROM` | Önerilir | Doğrulanmış gönderici adresi |
| `NEXT_PUBLIC_BANK_*` | Yayın öncesi | Havale/EFT bilgileri |
| `IYZICO_API_KEY/SECRET_KEY` | Hayır | İyzico entegrasyonu aktif edilince |

## Proje Yapısı

```
src/
├── app/           # Sayfalar (App Router) + API rotaları
├── components/    # shared / shop / ui bileşenleri
├── context/       # Cart, Auth, Favorites (localStorage tabanlı)
├── data/          # Ürün kataloğu (products.ts)
├── hooks/         # useKnifeFilter
└── lib/           # site config, email, payment, schema (SEO), utils
```

## Bilinen Eksikler / Yol Haritası

- **Ödeme**: `/api/checkout` şu an demo modda; İyzico entegrasyon kodu hazır ama devre dışı (`src/app/api/checkout/route.ts`).
- **Veritabanı yok**: kullanıcılar in-memory `Map`'te tutuluyor, sunucu yeniden başlayınca silinir. Sipariş geçmişi kalıcı değil.
- **İletişim bilgileri**: `src/lib/site.ts` içindeki telefon/WhatsApp/IBAN değerleri yer tutucudur, yayın öncesi gerçek değerlerle güncellenmelidir.
- Ürün görselleri harici `bicakmarket.com` alan adından yükleniyor.

## Komutlar

```bash
npm run dev     # geliştirme sunucusu
npm run build   # production build
npm run start   # production sunucusu
npm run lint    # eslint
```
