/**
 * Next.js Proxy — Route Protection
 * TEDxNewCairoSTEMYouth
 *
 * Optimistic session/role checks before routes render.
 * Authoritative checks also run in server actions and admin layout.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ROUTES } from "@/constants/routes";
import {
  AUTH_ROUTES,
  getDefaultRedirect,
  isAdminProtectedPath,
  isAdminRole,
  isSponsorRole,
  matchesPathPrefix,
  SPONSOR_ONLY_PATHS,
  TICKET_REQUIRED_PATHS,
} from "@/lib/auth/route-guards";

function redirectToLogin(req: NextRequest, from: string): NextResponse {
  const url = new URL(ROUTES.LOGIN, req.url);
  url.searchParams.set("callbackUrl", from);
  return NextResponse.redirect(url);
}

function redirectToAdminLogin(req: NextRequest, from: string): NextResponse {
  const url = new URL(ROUTES.ADMIN.LOGIN, req.url);
  url.searchParams.set("callbackUrl", from);
  return NextResponse.redirect(url);
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role ?? null;
  const isActive = session?.user?.isActive ?? false;
  const ticketStatus = session?.user?.ticketStatus ?? null;

  if (pathname === ROUTES.ADMIN.LOGIN) {
    if (isLoggedIn && isActive && isAdminRole(role)) {
      return NextResponse.redirect(new URL(ROUTES.ADMIN.HOME, req.url));
    }
    return NextResponse.next();
  }

  if (AUTH_ROUTES.some((path) => pathname.startsWith(path))) {
    if (isLoggedIn && isActive) {
      const redirectTo = getDefaultRedirect(role);
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    return NextResponse.next();
  }

  if (isLoggedIn && !isActive) {
    if (isAdminProtectedPath(pathname)) {
      return redirectToAdminLogin(req, pathname);
    }

    return redirectToLogin(req, pathname);
  }

  if (isAdminProtectedPath(pathname)) {
    if (!isLoggedIn) {
      return redirectToAdminLogin(req, pathname);
    }
    if (!isAdminRole(role)) {
      return NextResponse.redirect(new URL(ROUTES.UNAUTHORIZED, req.url));
    }
    return NextResponse.next();
  }

  if (matchesPathPrefix(pathname, SPONSOR_ONLY_PATHS)) {
    if (!isLoggedIn) {
      return redirectToLogin(req, pathname);
    }
    if (!isSponsorRole(role)) {
      return NextResponse.redirect(new URL(ROUTES.UNAUTHORIZED, req.url));
    }
    return NextResponse.next();
  }

  if (matchesPathPrefix(pathname, TICKET_REQUIRED_PATHS)) {
    if (!isLoggedIn) {
      return redirectToLogin(req, pathname);
    }

    if (isAdminRole(role)) {
      return NextResponse.next();
    }

    if (ticketStatus !== "confirmed" && ticketStatus !== "checked_in") {
      const url = new URL(ROUTES.MY_TICKET, req.url);
      url.searchParams.set("reason", "ticket_required");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard/:path*",
    "/survey/:path*",
    "/games/:path*",
    "/leaderboard/:path*",
    "/ticket/:path*",
    "/my-ticket/:path*",
    "/sponsor/:path*",
    "/login",
    "/register",
    "/verify-email",
    "/unauthorized",
  ],
};
