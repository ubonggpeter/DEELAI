import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";

export async function POST(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = JSON.parse(raw) as { userId: string };
  const { currentPassword, newPassword } = await req.json() as { currentPassword: string; newPassword: string };
  if (!currentPassword || !newPassword) return NextResponse.json({ error: "Both passwords required" }, { status: 400 });
  if (newPassword.length < 6) return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });

  const result = await adminStore.changePassword(session.userId, currentPassword, newPassword);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ success: true });
}
