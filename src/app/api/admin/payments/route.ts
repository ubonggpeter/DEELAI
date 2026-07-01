import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? "";
  let payments = [...adminStore.payments];
  if (status) payments = payments.filter((p) => p.status === status);
  return NextResponse.json({ payments });
}

export async function PATCH(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!adminStore.hasPermission(email, "manage_payments")) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }
  const { id, status } = await req.json();
  const payment = adminStore.payments.find((p) => p.id === id);
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  payment.status = status;
  return NextResponse.json({ payment });
}
