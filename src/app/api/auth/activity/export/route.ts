import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const session = JSON.parse(raw) as { userId: string };

  const { logs } = await adminStore.getActivityLogs(session.userId, { limit: 5000 });

  const header = "Date,Type,Title,Detail,Amount\n";
  const rows = logs.map((l) => {
    const date = new Date(l.createdAt).toISOString().replace("T", " ").slice(0, 19);
    const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
    const amt = l.amount != null ? `$${l.amount.toFixed(2)}` : "";
    return [esc(date), esc(l.type), esc(l.title), esc(l.detail), esc(amt)].join(",");
  });
  const csv = header + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="deelai-activity-${Date.now()}.csv"`,
    },
  });
}
