import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = req.nextUrl.searchParams.get("status") ?? "";
  let jobs = await adminStore.getAllJobs();
  if (status) jobs = jobs.filter((j) => j.status === status);
  return NextResponse.json({ jobs });
}

export async function PATCH(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await adminStore.hasPermission(email, "manage_jobs"))) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }
  const { id, status } = await req.json();
  const job = await adminStore.updateJobStatus(id, status);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ job });
}
