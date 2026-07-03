import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = req.nextUrl.searchParams.get("status") ?? "";
  let payments = await adminStore.getAllPayments();
  if (status) payments = payments.filter((p) => p.status === status);
  return NextResponse.json({ payments });
}

export async function PATCH(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await adminStore.hasPermission(email, "manage_payments"))) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }
  const { id, status } = await req.json();
  const payment = await adminStore.updatePaymentStatus(id, status);
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ payment });
}
