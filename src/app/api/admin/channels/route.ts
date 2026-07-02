import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

// GET — return the calling admin's channel (or all channels for super admin)
export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ channels: adminStore.channels });
  }
  const channel = adminStore.getChannelByOwner(email);
  return NextResponse.json({ channel: channel ?? null });
}

// POST — create channel for calling sub-admin
export async function POST(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isAdmin(email) || adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ error: "Sub-admin only" }, { status: 403 });
  }
  const body = await req.json();
  const { channelName, estTime, description, paystackPublicKey, paystackSecretKey, lensPaystackLink, referralCommissionRate, jobPassFee, isActive } = body;
  if (!channelName || !estTime) {
    return NextResponse.json({ error: "channelName and estTime are required" }, { status: 400 });
  }
  const sa = adminStore.subAdmins.find((s) => s.email === email);
  try {
    const ch = adminStore.createChannel({
      ownerEmail: email,
      channelName,
      estTime,
      description:           description            ?? "",
      paystackPublicKey:     paystackPublicKey     ?? "",
      paystackSecretKey:     paystackSecretKey      ?? "",
      lensPaystackLink:      lensPaystackLink       ?? "",
      referralCommissionRate: Number(referralCommissionRate ?? 10),
      jobPassFee:            Number(jobPassFee      ?? 0),
      isActive:              isActive               ?? true,
      region:                sa?.region             ?? "",
    });
    return NextResponse.json({ channel: ch }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

// PATCH — update existing channel
export async function PATCH(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { channelId, ...updates } = body;

  // Sub-admin can only update their own channel
  if (!adminStore.isSuperAdmin(email)) {
    const own = adminStore.getChannelByOwner(email);
    if (!own || own.id !== channelId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  const ch = adminStore.updateChannel(channelId, updates);
  if (!ch) return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  return NextResponse.json({ channel: ch });
}
