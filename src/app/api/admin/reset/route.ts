import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function POST(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  if (body.confirm !== "RESET") {
    return NextResponse.json({ error: "Send { confirm: 'RESET' } to confirm" }, { status: 400 });
  }
  const result = await adminStore.resetPlatform();
  return NextResponse.json({ ok: true, ...result });
}
