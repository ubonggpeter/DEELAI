import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

// GET — list registrations under the caller's channel (or all for super admin)
export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const statusFilter = searchParams.get("status") ?? "";

  let users;
  if (adminStore.isSuperAdmin(email)) {
    users = adminStore.getAllRegistrations();
  } else {
    const ch = adminStore.getChannelByOwner(email);
    if (!ch) return NextResponse.json({ registrations: [] });
    users = adminStore.getChannelRegistrations(ch.id);
  }

  if (statusFilter) users = users.filter((u) => u.accountStatus === statusFilter);

  return NextResponse.json({
    registrations: users.map((u) => ({
      id:            u.id,
      name:          u.name,
      email:         u.email,
      permitType:    u.permitType,
      accountStatus: u.accountStatus,
      cvUrl:         u.cvUrl,
      jobPassPaid:   u.jobPassPaid,
      jobPassAmount: u.jobPassAmount,
      channelId:     u.channelId,
      registeredAt:  u.registeredAt,
    })),
  });
}

// PATCH — approve or reject a registration
export async function PATCH(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId, action } = await req.json() as { userId: string; action: "approve" | "reject" };

  // Sub-admin can only approve/reject users in their channel
  if (!adminStore.isSuperAdmin(email)) {
    const ch = adminStore.getChannelByOwner(email);
    const user = adminStore.users.find((u) => u.id === userId);
    if (!ch || !user || user.channelId !== ch.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const updated =
    action === "approve" ? adminStore.approveRegistration(userId) :
    action === "reject"  ? adminStore.rejectRegistration(userId)  : null;

  if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user: updated });
}
