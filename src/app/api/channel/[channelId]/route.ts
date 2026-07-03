import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";

export async function GET(_req: NextRequest, { params }: { params: { channelId: string } }) {
  const ch = await adminStore.getChannelById(params.channelId);
  if (!ch) return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  // isActive is NOT checked here — existing approved users still need channel data
  // (e.g. lensPaystackLink) even after a sub-admin is removed/channel deactivated.
  // New registrations are blocked at the POST /register endpoint.
  return NextResponse.json({
    id:                     ch.id,
    channelName:            ch.channelName,
    estTime:                ch.estTime,
    paystackPublicKey:      ch.paystackPublicKey,
    referralCommissionRate: ch.referralCommissionRate,
    jobPassFee:             ch.jobPassFee,
    isActive:               ch.isActive,
    lensPaystackLink:       ch.lensPaystackLink,
  });
}
