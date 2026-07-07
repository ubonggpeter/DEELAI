import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const settings = await adminStore.getSettings();

  // Scope leaderboard to the requesting user's channel so users from different
  // channels don't see each other's performance data.
  let channelId: string | null = null;
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (raw) {
    try {
      const session = JSON.parse(raw) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { channelId: true } });
      channelId = user?.channelId ?? null;
    } catch { /* anonymous — show no results */ }
  }

  const users = await adminStore.getLeaderboard(settings.leaderboardThreshold, channelId);
  return NextResponse.json({ users, threshold: settings.leaderboardThreshold });
}
