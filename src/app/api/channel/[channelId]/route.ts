import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";

// Public — return safe channel info for the registration page
export async function GET(_req: NextRequest, { params }: { params: { channelId: string } }) {
  const ch = adminStore.getChannelById(params.channelId);
  if (!ch) return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  if (!ch.isActive) return NextResponse.json({ error: "This channel is not currently accepting registrations" }, { status: 403 });

  return NextResponse.json({
    id:                    ch.id,
    channelName:           ch.channelName,
    estTime:               ch.estTime,
    paystackPublicKey:     ch.paystackPublicKey,
    referralCommissionRate:ch.referralCommissionRate,
    jobPassFee:            ch.jobPassFee,
    isActive:              ch.isActive,
  });
}
