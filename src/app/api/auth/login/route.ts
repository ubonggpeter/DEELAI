import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE, ADMIN_COOKIE, SUPER_ADMIN_EMAIL } from "@/lib/adminConfig";

export async function POST(req: NextRequest) {
  const { email: rawEmail, password } = await req.json() as { email: string; password: string };
  if (!rawEmail || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  const email = rawEmail.trim().toLowerCase();

  // Super admin → admin dashboard (no worker session needed)
  if (email === SUPER_ADMIN_EMAIL) {
    if (!adminStore.verifyPassword(email, password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const res = NextResponse.json({ redirect: "/admin/dashboard" });
    res.cookies.set(ADMIN_COOKIE, email, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
    return res;
  }

  // Sub-admin → admin dashboard
  if (adminStore.isAdmin(email)) {
    if (!adminStore.verifyPassword(email, password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const res = NextResponse.json({ redirect: "/admin/dashboard" });
    res.cookies.set(ADMIN_COOKIE, email, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
    return res;
  }

  // Worker login
  const user = adminStore.getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "No account found with this email. Please register." }, { status: 404 });
  }
  if (!adminStore.verifyPassword(email, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = { userId: user.id, email, name: user.name, accountStatus: user.accountStatus, channelId: user.channelId };
  const res = NextResponse.json({
    redirect: user.accountStatus === "approved" ? "/dashboard" : null,
    accountStatus: user.accountStatus,
    user: session,
  });
  res.cookies.set(USER_COOKIE, JSON.stringify(session), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
