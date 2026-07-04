import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  try {
    const session = JSON.parse(raw) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { channelId: true } });
    const jobs = await adminStore.getAnnotationJobs(user?.channelId ?? null);
    return NextResponse.json({ jobs });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
