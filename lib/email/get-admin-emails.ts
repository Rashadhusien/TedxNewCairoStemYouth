import { inArray } from "drizzle-orm";

import { EMAIL } from "@/constants";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

function parseEnvAdminEmails(): string[] {
  const raw = process.env.ADMIN_NOTIFICATION_EMAILS?.trim();
  if (!raw) return [];

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/** Admin + organizer inboxes for ticket alerts. Falls back to ADMIN_NOTIFICATION_EMAILS or site EMAIL. */
export async function getAdminNotificationEmails(): Promise<string[]> {
  const fromEnv = parseEnvAdminEmails();
  if (fromEnv.length) return [...new Set(fromEnv)];

  const rows = await db
    .select({ email: users.email })
    .from(users)
    .where(inArray(users.role, ["admin", "organizer"]));

  const fromDb = rows
    .map((row) => row.email.trim().toLowerCase())
    .filter(Boolean);

  if (fromDb.length) return [...new Set(fromDb)];

  return EMAIL ? [EMAIL.toLowerCase()] : [];
}
