import { NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";

// Must be dynamic — admin writes change channel list; static caching would serve stale data
export const dynamic = "force-dynamic";

export async function GET() {
  const [channels, subAdmins] = await Promise.all([
    adminStore.getActiveChannels(),
    adminStore.getAllSubAdmins(),
  ]);
  const result = channels.map((c) => {
    const owner = subAdmins.find((s) => s.email === c.ownerEmail);
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
  return NextResponse.json({ channels: result });
}
