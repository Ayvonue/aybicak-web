// OpenAPI 3.1 spec for the public API, served at /api/v1/openapi.json.
// Kept as a plain object so it stays in sync with route changes via review;
// generating from code is a Phase 5+ nicety.

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Haber Terminali Public API",
    version: "1.0.0",
    description:
      "Düşük gecikmeli haber ve fiyat verisi API'si. REST uçları bu dokümandadır; " +
      "gerçek zamanlı akış için WebSocket protokolü /docs sayfasında anlatılır. " +
      "Tüm uçlar `Authorization: Bearer <api_key>` ister; anahtarlar /dashboard'dan alınır.",
  },
  servers: [{ url: "/api" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer" },
    },
    schemas: {
      NewsItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          summary: { type: "string", nullable: true },
          url: { type: "string" },
          published_at: { type: "string", format: "date-time" },
          category: { type: "string", enum: ["finans", "oyun", "hobi", "genel"] },
          source_name: { type: "string" },
          cluster_id: { type: "integer", nullable: true },
          source_count: {
            type: "integer",
            description: "Bu haberi bildiren kaynak sayısı (dedup cluster boyutu)",
          },
        },
      },
      Ticker: {
        type: "object",
        properties: {
          symbol: { type: "string" },
          exchange: { type: "string" },
          name: { type: "string" },
          currency: { type: "string" },
          is_delayed: {
            type: "boolean",
            description: "true ise veri gecikmelidir (örn. ECB günlük referans kuru)",
          },
          data_source: { type: "string" },
          price: { type: "string", nullable: true },
          quote_ts: { type: "string", format: "date-time", nullable: true },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/v1/news": {
      get: {
        summary: "Haber listesi",
        parameters: [
          {
            name: "category",
            in: "query",
            schema: { type: "string", enum: ["finans", "oyun", "hobi", "genel"] },
          },
          { name: "since", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
        ],
        responses: {
          "200": {
            description: "Cluster başına tek (kanonik) haber, en yeni önce",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: { type: "array", items: { $ref: "#/components/schemas/NewsItem" } },
                    count: { type: "integer" },
                  },
                },
              },
            },
          },
          "401": { description: "Geçersiz veya eksik API anahtarı" },
          "429": { description: "Dakikalık istek limiti aşıldı (X-RateLimit-* başlıklarına bakın)" },
        },
      },
    },
    "/v1/tickers": {
      get: {
        summary: "Tüm semboller ve son fiyatları",
        responses: {
          "200": {
            description: "Sembol listesi",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tickers: { type: "array", items: { $ref: "#/components/schemas/Ticker" } },
                    count: { type: "integer" },
                  },
                },
              },
            },
          },
          "401": { description: "Geçersiz veya eksik API anahtarı" },
          "429": { description: "Dakikalık istek limiti aşıldı" },
        },
      },
    },
    "/v1/tickers/{symbol}": {
      get: {
        summary: "Tek sembol: son fiyat + 100 noktalık tarihçe",
        parameters: [
          { name: "symbol", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Sembol detayı" },
          "404": { description: "Sembol bulunamadı" },
          "401": { description: "Geçersiz veya eksik API anahtarı" },
          "429": { description: "Dakikalık istek limiti aşıldı" },
        },
      },
    },
  },
} as const;
