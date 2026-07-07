import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ch = !adminStore.isSuperAdmin(email) ? await adminStore.getChannelByOwner(email) : null;
  const channelId = ch?.id ?? null;
  const docs = await adminStore.getModuleDocsForChannel(channelId);
  return NextResponse.json({ docs });
}

export async function POST(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json() as { moduleId: number; title: string; url: string; type: string };
  if (!body.moduleId || !body.title || !body.url) {
    return NextResponse.json({ error: "moduleId, title and url are required" }, { status: 400 });
  }
  const ch = !adminStore.isSuperAdmin(email) ? await adminStore.getChannelByOwner(email) : null;
  const channelId = ch?.id ?? null;
  const doc = await adminStore.addModuleDoc({
    moduleId: Number(body.moduleId),
    title: body.title, url: body.url, type: body.type ?? "pdf",
    channelId,
  });
  return NextResponse.json({ doc }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json() as { id: string };

  // Sub-admin can only delete their own channel's docs, not global ones
  if (!adminStore.isSuperAdmin(email)) {
    const ch  = await adminStore.getChannelByOwner(email);
    const row = await prisma.trainingModuleDoc.findUnique({ where: { id }, select: { channelId: true } });
    if (!row || row.channelId !== ch?.id) {
      return NextResponse.json({ error: "Forbidden: you can only remove your own channel resources" }, { status: 403 });
    }
  }

  const removed = await adminStore.removeModuleDoc(id);
  if (!removed) return NextResponse.json({ error: "Doc not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
