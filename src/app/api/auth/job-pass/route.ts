import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";
import type { PermitType } from "@/lib/adminStore";

export async function POST(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = JSON.parse(raw) as { userId: string; channelId?: string };
  if (!session.channelId) return NextResponse.json({ error: "No channel" }, { status: 400 });

  const { permitType, paystackRef } = await req.json() as { permitType: PermitType; paystackRef: string };
  if (!permitType) return NextResponse.json({ error: "permitType required" }, { status: 400 });

  const channel = await adminStore.getChannelById(session.channelId);
  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

  const user = await adminStore.updateJobPass(session.userId, permitType, channel.jobPassFee, session.channelId, paystackRef);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const newSession = { userId: user.id, email: user.email, name: user.name, accountStatus: user.accountStatus, channelId: user.channelId };
  const res = NextResponse.json({ success: true, user: newSession });
  res.cookies.set(USER_COOKIE, JSON.stringify(newSession), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
