import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";

export async function POST(req: NextRequest) {
  const { email } = await req.json() as { email: string };
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const user = await adminStore.getUserByEmail(email.trim().toLowerCase());
  // Return success even if the user isn't found — don't leak account existence
  if (!user || !user.channelId || user.accountStatus !== "approved") {
    return NextResponse.json({ success: true });
  }

  await adminStore.createPasswordResetRequest(user.id, user.channelId);
  return NextResponse.json({ success: true });
}
