import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin/** except /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /api/admin/** (all admin API routes)
  if (pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/check")) {
    const session = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
