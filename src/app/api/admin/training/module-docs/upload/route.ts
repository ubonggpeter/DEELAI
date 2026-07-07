import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";
import { uploadToSupabase } from "@/lib/supabaseStorage";

export async function POST(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    const moduleId = Number(formData.get("moduleId"));
    const title    = (formData.get("title") as string | null) ?? file?.name ?? "Resource";

    if (!file)     return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!moduleId) return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "File must be under 20MB" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    if (!["pdf", "doc", "docx"].includes(ext)) {
      return NextResponse.json({ error: "Only PDF, DOC or DOCX files allowed" }, { status: 400 });
    }

    const path        = `module-docs/mod${moduleId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const contentType = file.type || (ext === "pdf" ? "application/pdf" : "application/octet-stream");
    const url         = await uploadToSupabase("media", path, file, contentType);

    // Scope the doc to the uploading admin's channel (null = global for super-admin)
    const ch        = !adminStore.isSuperAdmin(email) ? await adminStore.getChannelByOwner(email) : null;
    const channelId = ch?.id ?? null;
    const type      = ext === "pdf" ? "pdf" : "doc";
    const doc       = await adminStore.addModuleDoc({ moduleId, title, url, type, channelId });
    return NextResponse.json({ doc }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }
}
