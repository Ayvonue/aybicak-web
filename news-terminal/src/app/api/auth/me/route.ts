import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: { id: user.id, email: user.email, plan_tier: user.planTier } });
}
