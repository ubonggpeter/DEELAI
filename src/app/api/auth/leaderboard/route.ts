import { NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await adminStore.getSettings();
  const users = await adminStore.getLeaderboard(settings.leaderboardThreshold);
  return NextResponse.json({ users, threshold: settings.leaderboardThreshold });
}
