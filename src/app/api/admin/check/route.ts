import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email) return NextResponse.json({ isAdmin: false }, { status: 200 });
  const info = await adminStore.getAdminInfo(email);
  if (!info) return NextResponse.json({ isAdmin: false }, { status: 200 });
  return NextResponse.json({ isAdmin: true, ...info });
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  const trimmed = email.trim().toLowerCase();
  if (!(await adminStore.isAdmin(trimmed))) {
    return NextResponse.json({ error: "Access denied. This email does not have admin privileges." }, { status: 403 });
  }
  const info = (await adminStore.getAdminInfo(trimmed))!;
  const res = NextResponse.json({ success: true, ...info });
  res.cookies.set(ADMIN_COOKIE, trimmed, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24,
  });
  return res;
}
