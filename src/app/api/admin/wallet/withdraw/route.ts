import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function POST(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await adminStore.getSettings();
  if (!settings.subAdminWithdrawEnabled && !adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ error: "Sub-admin withdrawals are currently disabled by the platform." }, { status: 403 });
  }

  const { amount } = await req.json() as { amount: number };
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Valid amount required" }, { status: 400 });
  }

  const bank = await adminStore.getAdminBank(email);
  if (!bank.bankAccountNumber) {
    return NextResponse.json({ error: "Please set up your bank account before withdrawing" }, { status: 400 });
  }

  const result = await adminStore.requestAdminWithdrawal(email, amount);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ success: true, ref: result.ref });
}
