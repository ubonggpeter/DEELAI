import { NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";

// Public — list all active channels for the landing page
export async function GET() {
  const channels = adminStore.getActiveChannels().map((c) => ({
    id:          c.id,
    channelName: c.channelName,
    description: c.description,
    estTime:     c.estTime,
    jobPassFee:  c.jobPassFee,
    isActive:    c.isActive,
  }));
  return NextResponse.json({ channels });
}
