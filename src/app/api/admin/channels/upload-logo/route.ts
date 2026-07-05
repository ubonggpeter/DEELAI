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
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
    if (!allowed.includes(ext)) return NextResponse.json({ error: "Only jpg, png, webp or gif allowed" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Max file size is 5MB" }, { status: 400 });

    // Resolve channel
    let channelId = form.get("channelId") as string | null;
    if (!channelId) {
      const ch = await adminStore.getChannelByOwner(email);
      if (!ch) return NextResponse.json({ error: "No channel found for this admin" }, { status: 404 });
      channelId = ch.id;
    } else if (!adminStore.isSuperAdmin(email)) {
      const own = await adminStore.getChannelByOwner(email);
      if (!own || own.id !== channelId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const path = `channel-${channelId}.${ext}`;
    const url = await uploadToSupabase("avatars", path, file, file.type || "image/jpeg");
    await adminStore.updateChannel(channelId, { logoUrl: url });

    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }
}
