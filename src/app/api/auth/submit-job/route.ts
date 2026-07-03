import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";

export async function POST(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = JSON.parse(raw) as { userId: string };

  const { type, batchId, earnings, accuracy } = await req.json() as {
    type: string; batchId: string; earnings: number; accuracy: number;
  };

  const result = await adminStore.submitUserJob(session.userId, { type, batchId, earnings, accuracy });
  return NextResponse.json(result);
}
