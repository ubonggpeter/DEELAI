import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ch = await adminStore.getChannelByOwner(email);
  if (!ch && !adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ bonuses: [] });
  }
  const channelId = ch?.id ?? req.nextUrl.searchParams.get("channelId") ?? "";
  const bonuses = channelId
    ? await adminStore.getReferralBonuses(channelId)
    : await adminStore.getAllReferralBonuses();
  return NextResponse.json({ bonuses });
}

export async function POST(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await adminStore.getSettings();
  if (!settings.refClaimEnabled) {
    return NextResponse.json({ error: "Referral bonus claims are temporarily disabled platform-wide." }, { status: 403 });
  }
  const { bonusId } = await req.json() as { bonusId: string };
  const updated = await adminStore.claimReferralBonus(bonusId);
  if (!updated) return NextResponse.json({ error: "Bonus not found or already processed" }, { status: 400 });
  return NextResponse.json({ bonus: updated });
}
