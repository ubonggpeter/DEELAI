import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";

export async function PATCH(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const session = JSON.parse(raw) as { userId: string };
    const body = await req.json() as { name?: string; displayName?: string };
    if (!body.name && !body.displayName) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    const updated = await adminStore.updateUserProfile(session.userId, body);
    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ success: true, name: updated.displayName ?? updated.name });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
