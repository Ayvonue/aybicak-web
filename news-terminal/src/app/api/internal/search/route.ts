import { NextRequest, NextResponse } from "next/server";
import { searchNews } from "@/lib/search";

// Terminal arayüzünün '/' aramasını besleyen auth'suz iç uç.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ items: [] });
  const items = await searchNews(q, { category: searchParams.get("category"), limit: 30 });
  return NextResponse.json({ items });
}
