import { ROUTES } from "@/constants/routes";

export const ADMIN_ACCESS_ROLES = new Set(["admin", "organizer"]);

export const SPONSOR_ACCESS_ROLES = new Set(["sponsor", "admin"]);

export const TICKET_REQUIRED_PATHS = [
  "/dashboard",
  "/survey",
  "/games",
  "/leaderboard",
  "/ticket",
] as const;

export const SPONSOR_ONLY_PATHS = ["/sponsor"] as const;

export const ADMIN_PROTECTED_PREFIX = "/admin";

export const ADMIN_PUBLIC_PATHS = [ROUTES.ADMIN.LOGIN] as const;

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const;

export function isAdminRole(role: string | null | undefined): boolean {
  return !!role && ADMIN_ACCESS_ROLES.has(role);
}

export function isSponsorRole(role: string | null | undefined): boolean {
  return !!role && SPONSOR_ACCESS_ROLES.has(role);
}

export function matchesPathPrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAdminProtectedPath(pathname: string): boolean {
  if (!matchesPathPrefix(pathname, [ADMIN_PROTECTED_PREFIX])) {
    return false;
  }

  return !ADMIN_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function getDefaultRedirect(role: string | null | undefined): string {
  switch (role) {
    case "admin":
    case "organizer":
      return ROUTES.ADMIN.HOME;
    case "sponsor":
      return ROUTES.SPONSOR.HOME;
    default:
      return ROUTES.HOME;
  }
}

export function getSafeCallbackUrl(
  callbackUrl: string | null | undefined,
  fallback: string,
): string {
  if (!callbackUrl) {
    return fallback;
  }

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return fallback;
  }

  return callbackUrl;
}
