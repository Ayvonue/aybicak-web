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
  {
    name: "Bloomberg HT",
    url: "https://www.bloomberght.com/rss",
    categorySlug: "finans",
    pollIntervalSec: 60,
  },
  {
    name: "Sözcü - Ekonomi",
    url: "https://www.sozcu.com.tr/feeds-rss-category-ekonomi",
    categorySlug: "finans",
    pollIntervalSec: 120,
  },
  {
    name: "NTV - Ekonomi",
    url: "https://www.ntv.com.tr/ekonomi.rss",
    categorySlug: "finans",
    pollIntervalSec: 180,
  },
  {
    name: "LOG",
    url: "https://www.log.com.tr/feed/",
    categorySlug: "oyun",
    pollIntervalSec: 600,
  },
  {
    name: "Webtekno",
    url: "https://www.webtekno.com/rss.xml",
    categorySlug: "hobi",
    pollIntervalSec: 600,
  },
  {
    name: "ShiftDelete",
    url: "https://shiftdelete.net/feed",
    categorySlug: "hobi",
    pollIntervalSec: 600,
  },
  {
    name: "CHIP Online",
    url: "https://www.chip.com.tr/rss",
    categorySlug: "hobi",
    pollIntervalSec: 900,
  },
  {
    name: "Anadolu Ajansı - Spor",
    url: "https://www.aa.com.tr/tr/rss/default?cat=spor",
    categorySlug: "genel",
    pollIntervalSec: 300,
  },
];
