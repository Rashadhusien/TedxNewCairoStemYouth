/**
 * Next.js Middleware — Route Protection
 * TEDxNewCairoSTEMYouth
 *
 * Protects routes by role and ticket status.
 * Runs on the Edge runtime before any page renders.
 *
 * Route groups:
 *   /dashboard/*      → attendees with confirmed ticket
 *   /sponsor/*        → sponsor role only
 *   /admin/*          → admin or organizer role only
 *   /login, /register → redirect to dashboard if already logged in
 */

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require a confirmed ticket (event access)
const TICKET_REQUIRED_PATHS = [
  "/dashboard",
  "/survey",
  "/games",
  "/leaderboard",
  "/ticket",
];

// Routes that require sponsor role
const SPONSOR_ONLY_PATHS = ["/sponsor"];

// Routes that require admin or organizer role
const ADMIN_ONLY_PATHS = ["/admin"];

// Routes that should redirect authenticated users away
const AUTH_ROUTES = ["/login", "/register"];

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role ?? null;
  const ticketStatus = session?.user?.ticketStatus ?? null;

  // ── Authenticated users shouldn't see login/register ──
  if (AUTH_ROUTES.some((p) => pathname.startsWith(p))) {
    if (isLoggedIn) {
      const redirectTo = getDefaultRedirect(role);
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    return NextResponse.next();
  }

  // ── Admin/Organizer routes ──
  if (ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) {
      return redirectToAdminLogin(req, pathname);
    }
    if (role !== "admin" && role !== "organizer") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    return NextResponse.next();
  }

  // ── Sponsor routes ──
  if (SPONSOR_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) {
      return redirectToLogin(req, pathname);
    }
    if (role !== "sponsor" && role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    return NextResponse.next();
  }

  // ── Attendee dashboard routes (require confirmed ticket) ──
  if (TICKET_REQUIRED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) {
      return redirectToLogin(req, pathname);
    }

    // Allow admins through regardless of ticket
    if (role === "admin" || role === "organizer") {
      return NextResponse.next();
    }

    // Attendees need a confirmed or checked-in ticket
    if (
      ticketStatus !== "confirmed" &&
      ticketStatus !== "checked_in"
    ) {
      // Redirect to their ticket status page with a message
      const url = new URL("/my-ticket", req.url);
      url.searchParams.set("reason", "ticket_required");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function redirectToLogin(req: NextRequest, from: string): NextResponse {
  const url = new URL("/login", req.url);
  url.searchParams.set("callbackUrl", from);
  return NextResponse.redirect(url);
}

function redirectToAdminLogin(req: NextRequest, from: string): NextResponse {
  const url = new URL("/admin/login", req.url);
  url.searchParams.set("callbackUrl", from);
  return NextResponse.redirect(url);
}

function getDefaultRedirect(role: string | null): string {
  switch (role) {
    case "admin":
    case "organizer":
      return "/admin/dashboard";
    case "sponsor":
      return "/sponsor/dashboard";
    default:
      return "/dashboard";
  }
}

// Only run middleware on these paths (not static files, API routes are self-protecting)
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/survey/:path*",
    "/games/:path*",
    "/leaderboard/:path*",
    "/ticket/:path*",
    "/my-ticket/:path*",
    "/sponsor/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
