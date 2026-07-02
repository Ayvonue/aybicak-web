export type SourceSeed = {
  name: string;
  url: string;
  categorySlug: "finans" | "oyun" | "hobi" | "genel";
  pollIntervalSec: number;
};

// Phase 1 MVP: a small curated RSS list across the four categories, tier-based
// polling cadence per the plan (finance = tight, general/hobby = looser).
export const SOURCE_SEEDS: SourceSeed[] = [
  {
    name: "Anadolu Ajansı - Ekonomi",
    url: "https://www.aa.com.tr/tr/rss/default?cat=ekonomi",
    categorySlug: "finans",
    pollIntervalSec: 60,
  },
  {
    name: "BBC Business",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    categorySlug: "finans",
    pollIntervalSec: 120,
  },
  {
    name: "GameSpot",
    url: "https://www.gamespot.com/feeds/game-news/",
    categorySlug: "oyun",
    pollIntervalSec: 600,
  },
  {
    name: "PC Gamer",
    url: "https://www.pcgamer.com/rss/",
    categorySlug: "oyun",
    pollIntervalSec: 600,
  },
  {
    name: "DonanımHaber - Tüm Haberler",
    url: "https://www.donanimhaber.com/rss/tum/",
    categorySlug: "hobi",
    pollIntervalSec: 600,
  },
  {
    name: "Anadolu Ajansı - Güncel",
    url: "https://www.aa.com.tr/tr/rss/default?cat=guncel",
    categorySlug: "genel",
    pollIntervalSec: 180,
  },
];
