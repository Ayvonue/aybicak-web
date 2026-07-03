import { getPool } from "@/lib/db";
import { SOURCE_SEEDS } from "@/ingestion/sources";
import { ensureSources, pollSource, connectRedisOptional } from "@/ingestion/poller";

// Always-on ingestion worker: each source polls on its own cadence
// (tier 1 finance feeds every ~60s, hobby blogs every ~10min — see
// sources.ts). Runs as a long-lived process next to the WS gateway.
async function main() {
  const redis = await connectRedisOptional();
  const sourceMap = await ensureSources();

  console.log(`[worker] started with ${SOURCE_SEEDS.length} sources`);

  for (const seed of SOURCE_SEEDS) {
    const meta = sourceMap.get(seed.url)!;
    let running = false;

    const tick = async () => {
      if (running) return; // skip a tick if the previous poll is still going
      running = true;
      try {
        const result = await pollSource(seed, meta, redis);
        if (result.inserted > 0 || result.failed) {
          console.log(
            `[worker] ${seed.name}: +${result.inserted} new${result.failed ? " (FETCH FAILED)" : ""}`
          );
        }
      } catch (err) {
        console.error(`[worker] ${seed.name} poll crashed:`, (err as Error).message);
      } finally {
        running = false;
      }
    };

    void tick(); // initial poll immediately
    setInterval(tick, seed.pollIntervalSec * 1000);
  }

  const shutdown = async () => {
    console.log("[worker] shutting down");
    await redis?.quit();
    await getPool().end();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
