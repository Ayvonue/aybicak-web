import { getPool } from "@/lib/db";

export type SearchResult = {
  id: number;
  title: string;
  summary: string | null;
  url: string;
  published_at: string;
  category: string;
  source_name: string;
  source_count: number;
  rank: number;
};

// websearch_to_tsquery: kullanıcı sözdizimi ("dolar faiz", "btc OR eth",
// "-hisse") güvenli şekilde tsquery'ye çevrilir; SQL injection yüzeyi yok.
export async function searchNews(
  q: string,
  opts: { category?: string | null; limit?: number } = {}
): Promise<SearchResult[]> {
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 50);
  const pool = getPool();
  const params: unknown[] = [q];
  let categoryFilter = "";
  if (opts.category) {
    params.push(opts.category);
    categoryFilter = `AND c.slug = $${params.length}`;
  }
  params.push(limit);

  const result = await pool.query<SearchResult>(
    `SELECT n.id, n.title, n.summary, n.url, n.published_at,
            c.slug AS category, s.name AS source_name,
            COALESCE(cl.item_count, 1) AS source_count,
            ts_rank(n.search_tsv, websearch_to_tsquery('simple', $1)) AS rank
     FROM news_items n
     JOIN categories c ON c.id = n.category_id
     JOIN sources s ON s.id = n.source_id
     LEFT JOIN clusters cl ON cl.id = n.cluster_id
     WHERE n.search_tsv @@ websearch_to_tsquery('simple', $1)
       AND (n.cluster_id IS NULL OR cl.canonical_item_id = n.id)
       ${categoryFilter}
     ORDER BY rank DESC, n.published_at DESC
     LIMIT $${params.length}`,
    params
  );
  return result.rows;
}
