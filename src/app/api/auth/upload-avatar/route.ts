import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";

export async function POST(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = JSON.parse(raw) as { userId: string };

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) return NextResponse.json({ error: "Only jpg, png, webp or gif allowed" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Max file size is 5MB" }, { status: 400 });

  const blob = await put(`avatars/${session.userId}.${ext}`, file, { access: "public", allowOverwrite: true });
  await adminStore.updateUserProfile(session.userId, { avatarUrl: blob.url });
  return NextResponse.json({ url: blob.url });
}
