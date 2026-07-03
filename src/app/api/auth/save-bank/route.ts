import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";

export async function POST(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = JSON.parse(raw) as { userId: string };
  const { bankCode, bankName, bankAccountNumber, bankAccountName } = await req.json() as {
    bankCode: string; bankName: string; bankAccountNumber: string; bankAccountName: string;
  };
  if (!bankCode || !bankName || !bankAccountNumber || !bankAccountName) {
    return NextResponse.json({ error: "All bank fields required" }, { status: 400 });
  }

  const updated = await adminStore.saveUserBank(session.userId, { bankCode, bankName, bankAccountNumber, bankAccountName });
  if (!updated) return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  return NextResponse.json({ success: true });
}
