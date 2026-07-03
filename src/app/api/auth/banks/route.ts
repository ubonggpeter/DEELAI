import { NextRequest, NextResponse } from "next/server";
import { USER_COOKIE } from "@/lib/adminConfig";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = JSON.parse(raw) as { userId: string };
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { channelId: true } });
  if (!user?.channelId) return NextResponse.json({ error: "No channel" }, { status: 400 });

  const channel = await prisma.channel.findUnique({
    where: { id: user.channelId }, select: { paystackSecretKey: true },
  });
  const secretKey = channel?.paystackSecretKey;
  if (!secretKey) return NextResponse.json({ error: "Channel Paystack not configured" }, { status: 400 });

  const resp = await fetch("https://api.paystack.co/bank?currency=NGN&perPage=100", {
    headers: { Authorization: `Bearer ${secretKey}` },
    next: { revalidate: 3600 }, // cache bank list for 1 hour
  });
  if (!resp.ok) return NextResponse.json({ error: "Failed to fetch banks" }, { status: 502 });
  const data = await resp.json() as { data: { name: string; code: string }[] };
  return NextResponse.json({ banks: data.data ?? [] });
}
