import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function POST(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { accountNumber, bankCode } = await req.json() as { accountNumber: string; bankCode: string };
  if (!accountNumber || !bankCode) {
    return NextResponse.json({ error: "accountNumber and bankCode required" }, { status: 400 });
  }
  const secretKey = await adminStore.getAdminPaystackKey(email);
  if (!secretKey) return NextResponse.json({ error: "Paystack not configured" }, { status: 400 });

  const resp = await fetch(
    `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );
  if (!resp.ok) return NextResponse.json({ error: "Could not resolve account — check account number and bank" }, { status: 400 });
  const data = await resp.json() as { data: { account_name: string } };
  return NextResponse.json({ accountName: data.data?.account_name ?? "" });
}
