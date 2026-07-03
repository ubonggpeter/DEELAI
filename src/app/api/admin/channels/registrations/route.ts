import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";
import { sendEmail, tplUserApproved, tplUserRejected } from "@/lib/emailService";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const statusFilter = req.nextUrl.searchParams.get("status") ?? "";
  let users;
  if (adminStore.isSuperAdmin(email)) {
    users = await adminStore.getAllRegistrations();
  } else {
    const ch = await adminStore.getChannelByOwner(email);
    if (!ch) return NextResponse.json({ registrations: [] });
    users = await adminStore.getChannelRegistrations(ch.id);
  }

  if (statusFilter) users = users.filter((u) => u.accountStatus === statusFilter);

  return NextResponse.json({
    registrations: users.map((u) => ({
      id: u.id, name: u.name, email: u.email, permitType: u.permitType,
      accountStatus: u.accountStatus, cvUrl: u.cvUrl,
      jobPassPaid: u.jobPassPaid, jobPassAmount: u.jobPassAmount,
      channelId: u.channelId, registeredAt: u.registeredAt,
    })),
  });
}

export async function PATCH(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId, action } = await req.json() as { userId: string; action: "approve" | "reject" };

  if (!adminStore.isSuperAdmin(email)) {
    const ch   = await adminStore.getChannelByOwner(email);
    const user = await adminStore.getUserById(userId);
    if (!ch || !user || user.channelId !== ch.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const updated =
    action === "approve" ? await adminStore.approveRegistration(userId) :
    action === "reject"  ? await adminStore.rejectRegistration(userId)  : null;

  if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const firstName = updated.name.split(" ")[0];
  const dashUrl   = `${process.env.NEXT_PUBLIC_URL ?? "https://deelai.vercel.app"}/dashboard`;

  if (action === "approve") {
    await sendEmail({ to: updated.email, subject: "Your DEELAI Account Has Been Approved!", html: tplUserApproved(firstName, dashUrl) });
  } else {
    await sendEmail({ to: updated.email, subject: "DEELAI Application Update", html: tplUserRejected(firstName) });
  }

  return NextResponse.json({ user: updated });
}
