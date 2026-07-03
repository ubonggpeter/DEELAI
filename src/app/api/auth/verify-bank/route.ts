import { NextRequest, NextResponse } from "next/server";
import { USER_COOKIE } from "@/lib/adminConfig";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = JSON.parse(raw) as { userId: string };
  const { accountNumber, bankCode } = await req.json() as { accountNumber: string; bankCode: string };
  if (!accountNumber || !bankCode) return NextResponse.json({ error: "accountNumber and bankCode required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { channelId: true } });
  if (!user?.channelId) return NextResponse.json({ error: "No channel" }, { status: 400 });

  const channel = await prisma.channel.findUnique({
    where: { id: user.channelId }, select: { paystackSecretKey: true },
  });
  const secretKey = channel?.paystackSecretKey;
  if (!secretKey) return NextResponse.json({ error: "Channel Paystack not configured" }, { status: 400 });

  const resp = await fetch(
    `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );
  if (!resp.ok) return NextResponse.json({ error: "Could not resolve account — check account number and bank" }, { status: 400 });
  const data = await resp.json() as { data: { account_name: string; account_number: string } };
  return NextResponse.json({ accountName: data.data?.account_name ?? "" });
}
