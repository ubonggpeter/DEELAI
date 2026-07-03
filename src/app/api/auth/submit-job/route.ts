import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";

export async function POST(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = JSON.parse(raw) as { userId: string };
  const { type, batchId, accuracy } = await req.json() as {
    type: string; batchId: string; accuracy: number;
  };

  const result = await adminStore.submitUserJob(session.userId, { type, batchId, accuracy });

  await adminStore.logActivity(session.userId, {
    type: result.status === "approved" ? "job_submitted" : "job_rejected",
    title: result.status === "approved" ? `Job submitted — ${accuracy}% accuracy` : `Job rejected — ${accuracy}% accuracy`,
    detail: result.reason,
    amount: result.earnings > 0 ? result.earnings : undefined,
  });

  return NextResponse.json(result);
}
