import { getPool } from "@/lib/db";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

type Stats = { news: number; sources: number; clusters: number } | null;

async function getStats(): Promise<Stats> {
  try {
    const pool = getPool();
    const result = await pool.query<{ news: string; sources: string; clusters: string }>(
      `SELECT
         (SELECT count(*) FROM news_items) AS news,
         (SELECT count(*) FROM sources WHERE active) AS sources,
         (SELECT count(*) FROM clusters WHERE item_count > 1) AS clusters`
    );
    const r = result.rows[0];
    return { news: Number(r.news), sources: Number(r.sources), clusters: Number(r.clusters) };
  } catch {
    return null; // DB yoksa sayfa yine açılır, sayılar gizlenir
  }
}

export default async function LandingPage() {
  const stats = await getStats();

  return (
    <div className="page landing">
      <div className="header">
        <h1>
          Haber <span className="accent">Terminali</span>
        </h1>
        <div className="header-right">
          <a className="mode-link" href="/docs">
            API →
          </a>
          <ThemeToggle />
        </div>
      </div>

      <section className="hero">
        <p className="hero-eyebrow">finans · oyun · hobi · genel</p>
        <h2>
          Gürültü değil, <span className="accent">haber</span>.
        </h2>
        <p className="hero-sub">
          Aynı haberi yirmi kez göstermeyen, verinin canlı mı gecikmeli mi olduğunu açıkça
          söyleyen, saniyeler içinde ileten bir haber akışı. Trader için yoğun terminal,
          meraklısı için sakin bir okuma modu — ikisi de aynı düşük gecikmeli altyapıda.
        </p>
      </section>

      <section className="modes">
        <a className="mode-card" href="/feed">
          <span className="mode-kicker">sade görünüm</span>
          <h3>Akış</h3>
          <p>
            Kategori sekmeleri, temiz kartlar, kendiliğinden yenilenen sakin bir okuma
            deneyimi. Gece ve gündüz teması.
          </p>
          <span className="mode-cta">akışı aç →</span>
        </a>
        <a className="mode-card" href="/terminal">
          <span className="mode-kicker">trader modu</span>
          <h3>Terminal</h3>
          <p>
            WebSocket ile anlık başlıklar, canlı fiyat şeridi, watchlist, süresiz fiyat
            alarmları ve klavyeyle gezinme. Kopan bağlantı kaldığı yerden devam eder.
          </p>
          <span className="mode-cta">terminali aç →</span>
        </a>
        <a className="mode-card" href="/docs">
          <span className="mode-kicker">geliştiriciler için</span>
          <h3>API</h3>
          <p>
            REST + WebSocket. Haber, fiyat ve arama uçları; kaynak birleştirme ve
            CANLI/GECİKMELİ işaretleri API yanıtlarında da açık.
          </p>
          <span className="mode-cta">dokümantasyon →</span>
        </a>
      </section>

      {stats && (
        <section className="stats">
          <div className="stat">
            <span className="stat-num">{stats.news.toLocaleString("tr-TR")}</span>
            <span className="stat-label">haber arşivde</span>
          </div>
          <div className="stat">
            <span className="stat-num">{stats.sources}</span>
            <span className="stat-label">aktif kaynak</span>
          </div>
          <div className="stat">
            <span className="stat-num">{stats.clusters.toLocaleString("tr-TR")}</span>
            <span className="stat-label">birleştirilmiş mükerrer haber</span>
          </div>
        </section>
      )}

      <footer className="landing-foot">
        <span>Veri durumu her ekranda açıkça işaretlenir — gecikmeli veri gecikmeli der.</span>
        <span>Yatırım tavsiyesi değildir.</span>
      </footer>
    </div>
  );
}
