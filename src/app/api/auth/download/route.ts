import { NextRequest, NextResponse } from "next/server";
import { USER_COOKIE, ADMIN_COOKIE } from "@/lib/adminConfig";

export async function GET(req: NextRequest) {
  const userCookie  = req.cookies.get(USER_COOKIE)?.value;
  const adminCookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!userCookie && !adminCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const fileUrl = req.nextUrl.searchParams.get("url");
  if (!fileUrl) return NextResponse.json({ error: "url param required" }, { status: 400 });

  // Only proxy URLs from our own Supabase project to prevent open-redirect abuse
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, "");
  let parsed: URL;
  try { parsed = new URL(fileUrl); } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }
  if (supabaseHost && !parsed.hostname.endsWith(supabaseHost)) {
    return NextResponse.json({ error: "Disallowed URL" }, { status: 403 });
  }

  const upstream = await fetch(fileUrl);
  if (!upstream.ok) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Derive filename from the URL path
  const rawName = parsed.pathname.split("/").pop() ?? "download";
  const filename = decodeURIComponent(rawName);

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type":        contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control":       "private, max-age=3600",
    },
  });
}
