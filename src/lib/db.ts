import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Neon serverless (HTTP) istemcisi. DATABASE_URL yoksa modül yüklenirken
// çökmemesi için tembel (lazy) başlatılır.
let _sql: NeonQueryFunction<false, false> | null = null;

// Vercel'in Neon/Postgres entegrasyonu değişkeni farklı adlarla koyabilir;
// hepsini sırayla kontrol ederiz (havuzlu/pooled URL tercih edilir).
function getConnectionString(): string | undefined {
    return (
        process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.POSTGRES_PRISMA_URL ||
        process.env.DATABASE_URL_UNPOOLED ||
        process.env.POSTGRES_URL_NON_POOLING
    );
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
