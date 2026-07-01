import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Neon serverless (HTTP) istemcisi. DATABASE_URL yoksa modül yüklenirken
// çökmemesi için tembel (lazy) başlatılır.
let _sql: NeonQueryFunction<false, false> | null = null;

export function isDbConfigured(): boolean {
    return Boolean(process.env.DATABASE_URL);
}

export function getSql(): NeonQueryFunction<false, false> {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL tanımlı değil.");
    }
    if (!_sql) {
        _sql = neon(process.env.DATABASE_URL);
    }
    return _sql;
}
