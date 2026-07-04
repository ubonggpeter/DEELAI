import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";
import { prisma } from "@/lib/prisma";

function csv(rows: string[][]): string {
  return rows.map((row) =>
    row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\r\n");
}

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isSuperAdmin = adminStore.isSuperAdmin(email);
  const type = req.nextUrl.searchParams.get("type") ?? "registrations";

  let content = "";
  let filename = `${type}-export.csv`;

  if (type === "registrations") {
    const users = isSuperAdmin
      ? await adminStore.getAllRegistrations()
      : await (async () => {
          const ch = await adminStore.getChannelByOwner(email);
          return ch ? adminStore.getChannelRegistrations(ch.id) : [];
        })();
    content = csv([
      ["Name", "Email", "Phone", "Permit Type", "Status", "Job Pass Paid", "Fee ($)", "Registered At", "Channel ID"],
      ...users.map((u) => [u.name, u.email, u.phone, u.permitType ?? "", u.accountStatus, u.jobPassPaid ? "Yes" : "No", String(u.jobPassAmount), u.registeredAt ?? "", u.channelId ?? ""]),
    ]);
    filename = "registrations.csv";
  } else if (type === "payments") {
    const payments = await adminStore.getAllPayments();
    const scoped = isSuperAdmin ? payments : await (async () => {
      const ch = await adminStore.getChannelByOwner(email);
      if (!ch) return [];
      const ids = (await adminStore.getChannelRegistrations(ch.id)).map((u) => u.id);
      return payments.filter((p) => ids.includes(p.userId));
    })();
    content = csv([
      ["Ref", "User Name", "User ID", "Amount ($)", "Method", "Status", "Date"],
      ...scoped.map((p) => [p.ref, p.userName, p.userId, String(p.amount), p.method, p.status, p.date]),
    ]);
    filename = "payments.csv";
  } else if (type === "jobs") {
    const jobs = await adminStore.getAllJobs();
    const scoped = isSuperAdmin ? jobs : await (async () => {
      const ch = await adminStore.getChannelByOwner(email);
      if (!ch) return [];
      const ids = (await adminStore.getChannelRegistrations(ch.id)).map((u) => u.id);
      return jobs.filter((j) => ids.includes(j.userId));
    })();
    content = csv([
      ["Batch ID", "User Name", "Type", "Status", "Accuracy (%)", "Earnings ($)", "Submitted At"],
      ...scoped.map((j) => [j.batchId, j.userName, j.type, j.status, String(j.accuracy), String(j.earnings), j.submittedAt]),
    ]);
    filename = "jobs.csv";
  } else if (type === "referrals") {
    const refs = await adminStore.getAllReferrals();
    content = csv([
      ["Referrer Name", "Recruit Name", "Recruit Email", "Status", "Bonus Earned ($)", "Joined"],
      ...refs.map((r) => [r.referrerName, r.recruitName, r.recruitEmail, r.status, String(r.bonusEarned), r.joinedAt]),
    ]);
    filename = "referrals.csv";
  } else if (type === "activity") {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required for activity export" }, { status: 400 });
    const { logs } = await adminStore.getActivityLogs(userId, { limit: 5000 });
    content = csv([
      ["Type", "Title", "Detail", "Amount ($)", "Created At"],
      ...logs.map((l) => [l.type, l.title, l.detail, String(l.amount ?? ""), (l.createdAt as Date).toISOString()]),
    ]);
    filename = "activity.csv";
  } else if (type === "refbonuses") {
    const bonuses = await adminStore.getAllReferralBonuses();
    content = csv([
      ["Referrer Name", "Referrer Email", "Recruit Name", "Recruit Email", "Amount ($)", "Status", "Created At", "Claimed At"],
      ...bonuses.map((b) => [b.referrerName, b.referrerEmail, b.recruitName, b.recruitEmail, String(b.amount), b.status, b.createdAt, b.claimedAt ?? ""]),
    ]);
    filename = "referral-bonuses.csv";
  } else {
    return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function DELETE(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }
  const { type, userId } = await req.json() as { type: string; userId?: string };

  if (type === "payments") {
    await prisma.payment.deleteMany({});
  } else if (type === "jobs") {
    await prisma.job.deleteMany({});
  } else if (type === "referrals") {
    await prisma.referral.deleteMany({});
  } else if (type === "refbonuses") {
    await prisma.referralBonus.deleteMany({});
  } else if (type === "activity" && userId) {
    await adminStore.clearActivityLogs(userId);
  } else if (type === "activity") {
    await prisma.activityLog.deleteMany({});
  } else {
    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
