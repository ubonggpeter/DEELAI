import { NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";

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
  // Cache at CDN edge for 30s, serve stale for 60s while revalidating — safe because
  // channel mutations (admin panel) are infrequent and a 30–60s lag is acceptable
  return NextResponse.json({ channels: result }, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}
