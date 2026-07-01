import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    name: string; email: string; phone: string; password: string; channelId: string;
  };

  if (!body.name || !body.email || !body.password || !body.channelId) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();

  // Check channel exists
  const ch = adminStore.getChannelById(body.channelId);
  if (!ch || !ch.isActive) {
    return NextResponse.json({ error: "Channel not found or inactive" }, { status: 404 });
  }

  // Check if email already registered and has a password (= completed registration before)
  const existing = adminStore.getUserByEmail(email);
  if (existing && adminStore.verifyPassword(email, body.password)) {
    // Already registered — just return their session
    const session = { userId: existing.id, email, name: existing.name, accountStatus: existing.accountStatus, channelId: existing.channelId };
    const res = NextResponse.json({ success: true, user: session, alreadyExists: true });
    res.cookies.set(USER_COOKIE, JSON.stringify(session), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  }

  if (existing && !adminStore.verifyPassword(email, body.password)) {
    return NextResponse.json({ error: "An account with this email already exists. Please log in." }, { status: 409 });
  }

  // Create user
  const user = adminStore.registerUser({
    name:      body.name.trim(),
    email,
    phone:     body.phone ?? "",
    password:  body.password,
    channelId: body.channelId,
  });

  const session = { userId: user.id, email, name: user.name, accountStatus: user.accountStatus, channelId: user.channelId };
  const res = NextResponse.json({ success: true, user: session }, { status: 201 });
  res.cookies.set(USER_COOKIE, JSON.stringify(session), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
