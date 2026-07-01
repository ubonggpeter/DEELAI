import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = req.nextUrl;
  const q     = searchParams.get("q")?.toLowerCase()      ?? "";
  const tier  = searchParams.get("tier")                  ?? "";
  const status = searchParams.get("status")               ?? "";

  let users = adminStore.users.filter((u) => !u.is_super_admin);
  if (q)      users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  if (tier)   users = users.filter((u) => u.tier === tier);
  if (status) users = users.filter((u) => u.status === status);

  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, action } = await req.json();
  let user = null;
  if (action === "suspend")  user = adminStore.suspendUser(id);
  if (action === "activate") user = adminStore.activateUser(id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user });
}
