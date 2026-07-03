import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";
import type { Permission } from "@/lib/adminConfig";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }
  return NextResponse.json({ subAdmins: await adminStore.getAllSubAdmins() });
}

export async function POST(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }
  const body = await req.json();
  const { email: targetEmail, name, region, permissions } = body as {
    email: string; name: string; region: string; permissions: Permission[];
  };
  if (!targetEmail || !name || !region || !permissions) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const targetLower = targetEmail.trim().toLowerCase();
  if (adminStore.isSuperAdmin(targetLower)) {
    return NextResponse.json({ error: "Cannot modify super admin" }, { status: 400 });
  }
  const allSubs = await adminStore.getAllSubAdmins();
  if (allSubs.some((s) => s.email === targetLower)) {
    return NextResponse.json({ error: "User is already a sub-admin" }, { status: 400 });
  }
  const sa = await adminStore.createSubAdmin({ email: targetLower, name, region, permissions, createdBy: email });
  return NextResponse.json({ subAdmin: sa }, { status: 201 });
}
