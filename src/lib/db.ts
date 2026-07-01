import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Neon serverless (HTTP) istemcisi. DATABASE_URL yoksa modül yüklenirken
// çökmemesi için tembel (lazy) başlatılır.
let _sql: NeonQueryFunction<false, false> | null = null;

// Vercel'in Neon/Postgres entegrasyonu değişkeni farklı adlarla koyabilir;
// önce hazır bağlantı dizesi aranır, bulunamazsa ayrı PG* değişkenlerinden
// (Neon entegrasyonunun koyduğu PGHOST/PGUSER/... ) inşa edilir.
function getConnectionString(): string | undefined {
    const direct =
        process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.POSTGRES_PRISMA_URL ||
        process.env.DATABASE_URL_UNPOOLED ||
        process.env.POSTGRES_URL_NON_POOLING;
    if (direct) return direct;

    // Ayrı parçalardan kur (Neon-Vercel entegrasyonu)
    const host = process.env.PGHOST || process.env.POSTGRES_HOST;
    const user = process.env.PGUSER || process.env.POSTGRES_USER;
    const password = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD;
    const database = process.env.PGDATABASE || process.env.POSTGRES_DATABASE;
    if (host && user && password && database) {
        return `postgresql://${user}:${password}@${host}/${database}?sslmode=require`;
    }
    return undefined;
}

export function isDbConfigured(): boolean {
    return Boolean(getConnectionString());
}

export function getSql(): NeonQueryFunction<false, false> {
    const url = getConnectionString();
    if (!url) {
        throw new Error("Veritabanı bağlantı adresi (DATABASE_URL/POSTGRES_URL) tanımlı değil.");
    }
    if (!_sql) {
        _sql = neon(url);
    }
    return _sql;
}
