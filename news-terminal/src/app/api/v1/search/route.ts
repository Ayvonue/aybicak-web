import { NextRequest, NextResponse } from "next/server";
import { authorizeApiRequest } from "@/lib/apiAuth";
import { searchNews } from "@/lib/search";

export async function GET(req: NextRequest) {
  const auth = await authorizeApiRequest(req);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "missing_query", detail: "q parametresi gerekli" }, { status: 400 });
  }
  const items = await searchNews(q, {
    category: searchParams.get("category"),
    limit: Number(searchParams.get("limit") ?? "20"),
  });
  return NextResponse.json({ items, count: items.length }, { headers: auth.rateHeaders });
}
