import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? "";
  let jobs = [...adminStore.jobs];
  if (status) jobs = jobs.filter((j) => j.status === status);
  return NextResponse.json({ jobs });
}

export async function PATCH(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!adminStore.hasPermission(email, "manage_jobs")) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }
  const { id, status } = await req.json();
  const job = adminStore.jobs.find((j) => j.id === id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  job.status = status;
  return NextResponse.json({ job });
}
