import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE, ADMIN_COOKIE, SUPER_ADMIN_EMAIL } from "@/lib/adminConfig";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const { email: rawEmail, password } = await req.json() as { email: string; password: string };
  if (!rawEmail || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  const email = rawEmail.trim().toLowerCase();

  // Super admin — lands on user dashboard; Admin Panel accessible via menu
  if (email === SUPER_ADMIN_EMAIL) {
    if (!(await adminStore.verifyPassword(email, password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const user = await adminStore.getUserByEmail(email);
    const userSession = {
      userId: user?.id ?? "u0", email, name: user?.name ?? "Super Admin",
      accountStatus: "approved" as const, channelId: user?.channelId,
    };
    const res = NextResponse.json({ redirect: "/dashboard" });
    res.cookies.set(USER_COOKIE, JSON.stringify(userSession), {
      httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
    });
    res.cookies.set(ADMIN_COOKIE, email, {
      httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24,
    });
    if (user?.id) {
      const hdrs = await headers();
      const ua = hdrs.get("user-agent") ?? "";
      await adminStore.logActivity(user.id, { type: "login", title: "Signed in", detail: ua.slice(0, 80) });
    }
    return res;
  }

  // Sub-admin → user dashboard (with admin link in sidebar) + admin panel both accessible
  if (await adminStore.isAdmin(email)) {
    if (!(await adminStore.verifyPassword(email, password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const subAdminUser = await adminStore.getUserByEmail(email);
    const res = NextResponse.json({ redirect: "/dashboard" });
    res.cookies.set(ADMIN_COOKIE, email, {
      httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24,
    });
    if (subAdminUser) {
      const userSession = { userId: subAdminUser.id, email, name: subAdminUser.name, accountStatus: "approved" as const, channelId: subAdminUser.channelId };
      res.cookies.set(USER_COOKIE, JSON.stringify(userSession), {
        httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
      });
      const hdrs = await headers();
      const ua = hdrs.get("user-agent") ?? "";
      await adminStore.logActivity(subAdminUser.id, { type: "login", title: "Signed in", detail: ua.slice(0, 80) });
    }
    return res;
  }

  // Regular worker
  const user = await adminStore.getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "No account found with this email. Please register." }, { status: 404 });
  }
  if (!(await adminStore.verifyPassword(email, password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = { userId: user.id, email, name: user.name, accountStatus: user.accountStatus, channelId: user.channelId };
  const res = NextResponse.json({
    redirect: user.accountStatus === "approved" ? "/dashboard" : null,
    accountStatus: user.accountStatus, user: session,
  });
  res.cookies.set(USER_COOKIE, JSON.stringify(session), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
  });
  if (user.accountStatus === "approved") {
    const hdrs = await headers();
    const ua = hdrs.get("user-agent") ?? "";
    await adminStore.logActivity(user.id, { type: "login", title: "Signed in", detail: ua.slice(0, 80) });
  }
  return res;
}
