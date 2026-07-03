import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Super admin sees all channels; sub-admin sees only their channel
  let channelId: string | undefined;
  if (!adminStore.isSuperAdmin(email)) {
    const ch = await adminStore.getChannelByOwner(email);
    if (!ch) return NextResponse.json({ requests: [] });
    channelId = ch.id;
  }

  const requests = await adminStore.getPendingPasswordResets(channelId);
  return NextResponse.json({ requests });
}

export async function PATCH(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId, newPassword } = await req.json() as { requestId: string; newPassword: string };
  if (!requestId || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "requestId and newPassword (min 6 chars) are required" }, { status: 400 });
  }

  // Sub-admin can only fulfill requests from their own channel
  if (!adminStore.isSuperAdmin(email)) {
    const ch = await adminStore.getChannelByOwner(email);
    const reqs = await adminStore.getPendingPasswordResets(ch?.id);
    if (!reqs.some((r) => r.id === requestId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const ok = await adminStore.fulfillPasswordResetRequest(requestId, newPassword);
  if (!ok) return NextResponse.json({ error: "Request not found, already fulfilled, or expired" }, { status: 404 });
  return NextResponse.json({ success: true });
}
