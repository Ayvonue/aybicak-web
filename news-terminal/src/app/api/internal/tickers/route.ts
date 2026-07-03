import { NextResponse } from "next/server";
import { listTickersWithLatest } from "@/lib/tickers";

// First-party endpoint for the terminal UI's REST fallback when the WS
// gateway is unreachable; the public surface is /api/v1/tickers.
export async function GET() {
  const tickers = await listTickersWithLatest();
  return NextResponse.json({ tickers });
}
