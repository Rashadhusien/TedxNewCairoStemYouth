import { headers } from "next/headers";

/**
 * Extracts the real client IP from Next.js request headers.
 * Falls back to a static string so rate limiting still works in dev.
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "127.0.0.1"
  );
}
