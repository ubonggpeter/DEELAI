import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";
import type { Permission } from "@/lib/adminConfig";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }
  const body = await req.json() as { region?: string; permissions?: Permission[] };
  const updated = await adminStore.updateSubAdmin(params.id, body);
  if (!updated) return NextResponse.json({ error: "Sub-admin not found" }, { status: 404 });
  return NextResponse.json({ subAdmin: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const email = _req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }
  const deleted = await adminStore.deleteSubAdmin(params.id);
  if (!deleted) return NextResponse.json({ error: "Sub-admin not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
