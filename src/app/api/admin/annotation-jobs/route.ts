import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Super admin sees global jobs; sub-admin sees their channel's jobs
  let channelId: string | null = null;
  if (!adminStore.isSuperAdmin(email)) {
    const ch = await adminStore.getChannelByOwner(email);
    channelId = ch?.id ?? null;
  }
  const jobs = await adminStore.getAnnotationJobs(channelId);
  return NextResponse.json({ jobs });
}

export async function POST(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json() as {
    title: string; description?: string; imageUrls: string[];
    labels: string[]; difficulty: string;
  };
  if (!body.title || !body.imageUrls?.length || !body.labels?.length) {
    return NextResponse.json({ error: "title, imageUrls, and labels are required" }, { status: 400 });
  }
  let channelId: string | null = null;
  if (!adminStore.isSuperAdmin(email)) {
    const ch = await adminStore.getChannelByOwner(email);
    channelId = ch?.id ?? null;
  }
  const job = await adminStore.addAnnotationJob({
    channelId, title: body.title, description: body.description ?? "",
    imageUrls: body.imageUrls, labels: body.labels, difficulty: body.difficulty ?? "medium",
    createdBy: email,
  });
  return NextResponse.json({ job }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json() as { id: string };

  // Sub-admin can only delete jobs belonging to their channel
  if (!adminStore.isSuperAdmin(email)) {
    const ch   = await adminStore.getChannelByOwner(email);
    const jobs = await adminStore.getAnnotationJobs(ch?.id ?? null);
    if (!jobs.some((j) => j.id === id)) {
      return NextResponse.json({ error: "Forbidden: you can only delete your own channel's jobs" }, { status: 403 });
    }
  }

  const removed = await adminStore.deleteAnnotationJob(id);
  if (!removed) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
