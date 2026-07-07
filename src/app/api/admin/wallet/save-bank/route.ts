import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function POST(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { bankCode, bankName, bankAccountNumber, bankAccountName } = await req.json() as {
    bankCode: string; bankName: string; bankAccountNumber: string; bankAccountName: string;
  };
  if (!bankCode || !bankName || !bankAccountNumber || !bankAccountName) {
    return NextResponse.json({ error: "All bank fields required" }, { status: 400 });
  }
  await adminStore.saveAdminBank(email, { bankCode, bankName, bankAccountNumber, bankAccountName });
  return NextResponse.json({ success: true });
}
