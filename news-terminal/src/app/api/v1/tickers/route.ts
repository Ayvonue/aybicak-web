import { NextRequest, NextResponse } from "next/server";
import { authorizeApiRequest } from "@/lib/apiAuth";
import { listTickersWithLatest } from "@/lib/tickers";

export async function GET(req: NextRequest) {
  const auth = await authorizeApiRequest(req);
  if (!auth.ok) return auth.response;

  const tickers = await listTickersWithLatest();
  return NextResponse.json(
    { tickers, count: tickers.length },
    { headers: auth.rateHeaders }
  );
}
