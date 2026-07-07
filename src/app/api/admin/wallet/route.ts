import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [balance, bank, withdrawals] = await Promise.all([
    adminStore.getAdminWalletBalance(email),
    adminStore.getAdminBank(email),
    adminStore.getAdminWithdrawals(email),
  ]);
  return NextResponse.json({ balance, bank, withdrawals });
}
