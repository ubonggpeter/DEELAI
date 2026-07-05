import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const docs = await adminStore.getAllModuleDocs();
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
  const doc = await adminStore.addModuleDoc({
    moduleId: Number(body.moduleId),
    title: body.title,
    url: body.url,
    type: body.type ?? "pdf",
  });
  return NextResponse.json({ doc }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json() as { id: string };
  const removed = await adminStore.removeModuleDoc(id);
  if (!removed) return NextResponse.json({ error: "Doc not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
