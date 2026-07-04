import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const session = JSON.parse(raw) as { userId: string; channelId?: string };
    const { walletType, amount, method } = await req.json() as {
      walletType: "work" | "recruit"; amount: number; method: string;
    };

    if (!walletType || !amount || !method) {
      return NextResponse.json({ error: "walletType, amount, and method are required" }, { status: 400 });
    }

    // Check if the wallet is enabled for this channel
    if (session.channelId) {
      const channel = await prisma.channel.findUnique({
        where: { id: session.channelId },
        select: { workWalletEnabled: true, recruitWalletEnabled: true },
      });
      if (channel) {
        if (walletType === "work" && !channel.workWalletEnabled) {
          return NextResponse.json({ error: "Work Wallet withdrawals are currently disabled by your admin." }, { status: 403 });
        }
        if (walletType === "recruit" && !channel.recruitWalletEnabled) {
          return NextResponse.json({ error: "Recruit Earnings withdrawals are currently disabled by your admin." }, { status: 403 });
        }
      }
    }

    const result = await adminStore.withdrawFromWallet(session.userId, walletType, amount, method);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    await adminStore.logActivity(session.userId, {
      type: "withdrawal",
      title: `Withdrawal — ${method}`,
      detail: `$${amount.toFixed(2)} from ${walletType === "work" ? "Work Wallet" : "Recruit Earnings"}`,
      amount: -amount,
    });

    return NextResponse.json({
      ok: true,
      ref: result.ref,
      newWorkWallet: result.newWorkWallet,
      newRecruitWallet: result.newRecruitWallet,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
