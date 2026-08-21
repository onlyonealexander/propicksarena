import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "propicks_admin";
const USER_COOKIE = "propicks_uid";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasAdmin = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!hasAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname.startsWith("/wallet") || pathname.startsWith("/account")) {
    const hasUser = request.cookies.get(USER_COOKIE)?.value;
    if (!hasUser) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/wallet/:path*", "/account/:path*"],
};
