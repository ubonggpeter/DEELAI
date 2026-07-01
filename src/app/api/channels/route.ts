import { NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";

// Public — list active channels with owner region for landing page grouping
export async function GET() {
  const channels = adminStore.getActiveChannels().map((c) => {
    const owner = adminStore.subAdmins.find((s) => s.email === c.ownerEmail);
    return {
      id:          c.id,
      channelName: c.channelName,
      description: c.description,
      estTime:     c.estTime,
      jobPassFee:  c.jobPassFee,
      isActive:    c.isActive,
      region:      owner?.region ?? "Global",
    };
  });
  return NextResponse.json({ channels });
}
