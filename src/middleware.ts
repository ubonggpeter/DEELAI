import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, USER_COOKIE } from "@/lib/adminConfig";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* ── Admin routes ────────────────────────────────────────────────── */
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/check")) {
    const session = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* ── Worker dashboard ────────────────────────────────────────────── */
  if (pathname.startsWith("/dashboard")) {
    const session = req.cookies.get(USER_COOKIE)?.value;
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  /* ── Redirect already-approved users away from login/register ────── */
  if (pathname === "/login" || pathname === "/register") {
    const userSession = req.cookies.get(USER_COOKIE)?.value;
    if (userSession) {
      try {
        const s = JSON.parse(userSession) as { accountStatus?: string };
        if (s.accountStatus === "approved") {
          const url = req.nextUrl.clone();
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }
      } catch { /* ignore malformed cookie */ }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/dashboard/:path*", "/login", "/register"],
};
