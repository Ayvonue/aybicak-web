export const metadata = { title: "API Dokümantasyonu — Haber Terminali" };

export default function DocsPage() {
  return (
    <div className="docs">
      <div className="header">
        <h1>
          API <span className="accent">Dokümantasyonu</span>
        </h1>
        <div className="header-right">
          <a className="mode-link" href="/dashboard">
            anahtar al →
          </a>
        </div>
      </div>

      <p>
        Haber Terminali API&apos;si iki yüzey sunar: <strong>REST</strong> (geçmiş/anlık sorgular) ve{" "}
        <strong>WebSocket</strong> (düşük gecikmeli canlı akış). Makine tarafından okunabilir spec:{" "}
        <a href="/api/v1/openapi.json">
          <code>/api/v1/openapi.json</code>
        </a>
      </p>

      <h2>Kimlik doğrulama</h2>
      <p>
        Tüm istekler <code>Authorization: Bearer &lt;api_key&gt;</code> başlığı ister. Anahtarınızı{" "}
        <a href="/dashboard">
          <code>/dashboard</code>
        </a>{" "}
        sayfasından oluşturun. Anahtar yalnızca oluşturma anında bir kez gösterilir.
      </p>

      <h2>Oran sınırları</h2>
      <table>
        <thead>
          <tr>
            <th>Plan</th>
            <th>REST</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>free</td>
            <td>60 istek/dk</td>
          </tr>
          <tr>
            <td>pro</td>
            <td>600 istek/dk</td>
          </tr>
        </tbody>
      </table>
      <p>
        Her yanıt <code>X-RateLimit-Limit</code> ve <code>X-RateLimit-Remaining</code> başlıklarını
        taşır; limit aşımında <code>429</code> ve <code>Retry-After: 60</code> döner. Alarmlar ve
        anahtarlar kendiliğinden sona ermez — iptal etmediğiniz sürece çalışır.
      </p>

      <h2>REST uçları</h2>
      <pre>{`GET /api/v1/news?category=finans&limit=20&since=2026-07-01T00:00:00Z
GET /api/v1/tickers
GET /api/v1/tickers/BTC`}</pre>
      <p>
        Haber yanıtlarında <code>source_count</code>, aynı haberi bildiren kaynak sayısıdır
        (yakın-kopya başlıklar tek haber altında birleştirilir). Fiyat yanıtlarında{" "}
        <code>is_delayed</code> alanı verinin canlı mı gecikmeli mi olduğunu açıkça söyler.
      </p>

      <h2>WebSocket akışı</h2>
      <pre>{`wss://<host>/v1/stream   (yerel gelistirmede ws://localhost:3312/v1/stream)

// abone ol
{ "type": "subscribe",
  "channels": ["news:finans", "news:oyun", "ticker:BTC"],
  "last_event_id": "opsiyonel — kopmadan önceki son stream id" }

// sunucudan gelenler
{ "type": "subscribed", "channels": [...] }
{ "type": "backlog", "resumed": false, "events": [{ "stream_id", "event" }] }
{ "type": "ticker_snapshot", "events": [{ "stream_id", "event" }] }
{ "type": "event",  "stream_id": "...", "event": { ...haber } }
{ "type": "ticker", "stream_id": "...", "event": { ...fiyat } }`}</pre>
      <p>
        Kanallar: <code>news:all</code>, <code>news:&lt;kategori&gt;</code>,{" "}
        <code>ticker:all</code>, <code>ticker:&lt;SEMBOL&gt;</code>. Bağlantı koptuğunda son
        gördüğünüz <code>stream_id</code>&apos;yi <code>last_event_id</code> olarak gönderin —
        kaçırdığınız tüm olaylar sırayla yeniden iletilir (kayıpsız devam).
      </p>

      <h2>Örnek</h2>
      <pre>{`curl -H "Authorization: Bearer nt_live_..." \\
  "https://<host>/api/v1/news?category=finans&limit=5"`}</pre>
    </div>
  );
}
