-- News Terminal — Phase 1 MVP schema
-- Organizations/multi-tenancy and api_keys are included from day one (see plan §"Büyük Ölçek & Genişleyebilirlik")
-- so a later enterprise/team rollout doesn't require a breaking schema migration.

CREATE TABLE IF NOT EXISTS organizations (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  org_id        INTEGER REFERENCES organizations(id),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  plan_tier     TEXT NOT NULL DEFAULT 'free',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS org_members (
  org_id        INTEGER NOT NULL REFERENCES organizations(id),
  user_id       INTEGER NOT NULL REFERENCES users(id),
  role          TEXT NOT NULL DEFAULT 'member', -- owner | admin | member
  PRIMARY KEY (org_id, user_id)
);

CREATE TABLE IF NOT EXISTS categories (
  id            SERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,   -- finans | oyun | hobi | genel
  label         TEXT NOT NULL,
  parent_id     INTEGER REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS sources (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'rss', -- rss | api | scrape | webhook
  url             TEXT NOT NULL UNIQUE,
  category_id     INTEGER REFERENCES categories(id),
  poll_interval_sec INTEGER NOT NULL DEFAULT 300,
  reliability_score REAL NOT NULL DEFAULT 1.0,
  robots_allowed  BOOLEAN NOT NULL DEFAULT true,
  active          BOOLEAN NOT NULL DEFAULT true,
  last_polled_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS clusters (
  id                SERIAL PRIMARY KEY,
  canonical_item_id INTEGER,
  canonical_title   TEXT NOT NULL,
  first_seen_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  item_count        INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS tickers (
  id          SERIAL PRIMARY KEY,
  symbol      TEXT UNIQUE NOT NULL,
  exchange    TEXT NOT NULL,   -- BIST | NASDAQ | ...
  name        TEXT NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'TRY',
  is_delayed  BOOLEAN NOT NULL DEFAULT true,
  data_source TEXT
);

CREATE TABLE IF NOT EXISTS news_items (
  id             SERIAL PRIMARY KEY,
  source_id      INTEGER NOT NULL REFERENCES sources(id),
  external_id    TEXT,               -- guid from the feed, for dedup
  title          TEXT NOT NULL,
  summary        TEXT,
  url            TEXT NOT NULL,
  image_url      TEXT,
  published_at   TIMESTAMPTZ,
  ingested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  category_id    INTEGER REFERENCES categories(id),
  ticker_ids     INTEGER[] NOT NULL DEFAULT '{}',
  cluster_id     INTEGER REFERENCES clusters(id),
  lang           TEXT NOT NULL DEFAULT 'tr',
  title_hash     TEXT NOT NULL,      -- normalized-title hash, Phase 1 dedup key (simhash clustering lands in Phase 2)
  UNIQUE (source_id, external_id),
  UNIQUE (url)
);

CREATE INDEX IF NOT EXISTS idx_news_items_category_published ON news_items (category_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_title_hash ON news_items (title_hash);
CREATE INDEX IF NOT EXISTS idx_news_items_published_at ON news_items (published_at DESC);

CREATE TABLE IF NOT EXISTS api_keys (
  id                SERIAL PRIMARY KEY,
  org_id            INTEGER REFERENCES organizations(id),
  user_id           INTEGER REFERENCES users(id),
  key_hash          TEXT NOT NULL UNIQUE,
  prefix            TEXT NOT NULL,       -- shown in dashboards, e.g. "nt_live_ab12"
  tier              TEXT NOT NULL DEFAULT 'free',
  custom_rate_limit INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at      TIMESTAMPTZ,
  revoked_at        TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS watchlists (
  user_id      INTEGER NOT NULL REFERENCES users(id),
  ticker_ids   INTEGER[] NOT NULL DEFAULT '{}',
  category_ids INTEGER[] NOT NULL DEFAULT '{}',
  PRIMARY KEY (user_id)
);

-- Phase 2: 64-bit simhash of the title (stored signed) for near-duplicate
-- clustering; NULL on rows ingested before Phase 2.
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS simhash BIGINT;
CREATE INDEX IF NOT EXISTS idx_news_items_ingested_at ON news_items (ingested_at DESC);

INSERT INTO categories (slug, label) VALUES
  ('finans', 'Finans'),
  ('oyun', 'Oyun'),
  ('hobi', 'Hobi'),
  ('genel', 'Genel')
ON CONFLICT (slug) DO NOTHING;
