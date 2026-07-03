import { readFileSync } from "node:fs";
import path from "node:path";
import { getPool } from "@/lib/db";

async function main() {
  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");
  const pool = getPool();
  await pool.query(schema);
  console.log("Schema applied.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
