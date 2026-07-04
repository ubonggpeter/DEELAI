import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export async function POST(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "File must be under 20MB" }, { status: 400 });

    // Use Vercel Blob if configured, otherwise return error with instructions
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json({ error: "File uploads require BLOB_READ_WRITE_TOKEN. Please paste a direct URL instead." }, { status: 503 });
    }

    const { put } = await import("@vercel/blob");
    const blob = await put(`training/${Date.now()}-${file.name}`, file, { access: "public", token: blobToken });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    return NextResponse.json({ error: `Upload failed: ${e instanceof Error ? e.message : "unknown error"}` }, { status: 500 });
  }
}
