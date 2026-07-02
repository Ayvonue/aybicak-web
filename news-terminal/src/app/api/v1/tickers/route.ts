import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/apiAuth";
import { listTickersWithLatest } from "@/lib/tickers";

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const tickers = await listTickersWithLatest();
  return NextResponse.json({ tickers, count: tickers.length });
}
