import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ channels: await adminStore.getAllChannels() });
  }
  const channel = await adminStore.getChannelByOwner(email);
  return NextResponse.json({ channel: channel ?? null });
}

export async function POST(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email)) || adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ error: "Sub-admin only" }, { status: 403 });
  }
  const body = await req.json();
  const { channelName, estTime, description, paystackPublicKey, paystackSecretKey, lensPaystackLink, referralCommissionRate, jobPassFee, isActive } = body;
  if (!channelName || !estTime) {
    return NextResponse.json({ error: "channelName and estTime are required" }, { status: 400 });
  }
  const allSubs = await adminStore.getAllSubAdmins();
  const sa = allSubs.find((s) => s.email === email);
  try {
    const ch = await adminStore.createChannel({
      ownerEmail: email, channelName, estTime,
      description:            description            ?? "",
      paystackPublicKey:      paystackPublicKey      ?? "",
      paystackSecretKey:      paystackSecretKey      ?? "",
      lensPaystackLink:       lensPaystackLink       ?? "",
      referralCommissionRate: Number(referralCommissionRate ?? 10),
      jobPassFee:             Number(jobPassFee      ?? 0),
      isActive:               isActive               ?? true,
      region:                 sa?.region             ?? "",
      workWalletEnabled:      true,
      recruitWalletEnabled:   true,
      refBonusMode:           "manual",
    });
    return NextResponse.json({ channel: ch }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { channelId, ...updates } = body;

  if (!adminStore.isSuperAdmin(email)) {
    const own = await adminStore.getChannelByOwner(email);
    if (!own || own.id !== channelId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  if (!channelId) return NextResponse.json({ error: "channelId is required" }, { status: 400 });
  try {
    const ch = await adminStore.updateChannel(channelId, updates);
    return NextResponse.json({ channel: ch });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[PATCH /api/admin/channels]", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
