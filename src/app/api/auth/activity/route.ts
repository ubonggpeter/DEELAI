import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const session = JSON.parse(raw) as { userId: string };

  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? "";
  const type   = url.searchParams.get("type") ?? "";
  const limit  = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 200);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  const result = await adminStore.getActivityLogs(session.userId, {
    search: search || undefined,
    type:   type   || undefined,
    limit, offset,
  });
  return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const session = JSON.parse(raw) as { userId: string };
  await adminStore.clearActivityLogs(session.userId);
  return NextResponse.json({ success: true });
}
