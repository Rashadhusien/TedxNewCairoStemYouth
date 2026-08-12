/**
 * Central audit logging helper.
 *
 * Writes append-only rows to the `audit_logs` table. Designed to be
 * fire-and-forget (`void createAuditLog(...)`) from server actions, webhooks
 * and internal helpers so that audit failures can never block the caller.
 *
 * Server-only — never import from client components.
 */
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { auditCategoryEnum, auditLogs, users } from "@/lib/db/schema";
import logger from "@/lib/logger";

export type AuditCategory = (typeof auditCategoryEnum.enumValues)[number];
export type AuditStatus = "success" | "failure" | "info";

export type AuditActor = {
  actorUserId?: string | null;
  actorEmail?: string | null;
  actorName?: string | null;
};

export type AuditLogInput = AuditActor & {
  category: AuditCategory;
  action: string;
  status?: AuditStatus;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: unknown;
  ipAddress?: string | null;
};

/** All valid audit categories — reused by the admin filter UI. */
export const AUDIT_CATEGORIES: AuditCategory[] = auditCategoryEnum.enumValues;

/**
 * Resolve an actor snapshot from a NextAuth session user shape.
 */
export function actorFromSession(session: {
  user?: { id?: string; email?: string | null; name?: string | null };
}): AuditActor {
  return {
    actorUserId: session?.user?.id ?? null,
    actorEmail: session?.user?.email ?? null,
    actorName: session?.user?.name ?? null,
  };
}

/**
 * Append a single audit log row. Never throws — on failure it falls back to
 * the pino logger so the primary action is unaffected.
 */
export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    let { actorEmail, actorName } = input;

    // Backfill the actor snapshot from the users table if only the id was given.
    if (input.actorUserId && (!actorEmail || !actorName)) {
      const [actor] = await db
        .select({
          email: users.email,
          name: users.name,
          fullName: users.fullName,
        })
        .from(users)
        .where(eq(users.id, input.actorUserId))
        .limit(1);

      if (actor) {
        actorEmail = actor.email;
        actorName = actor.fullName ?? actor.name ?? null;
      }
    }

    await db.insert(auditLogs).values({
      actorUserId: input.actorUserId ?? null,
      actorEmail: actorEmail ?? null,
      actorName: actorName ?? null,
      category: input.category,
      action: input.action,
      status: input.status ?? "success",
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      summary: input.summary,
      metadata: input.metadata,
      ipAddress: input.ipAddress ?? null,
    });
  } catch (error) {
    logger.error(
      { err: error, action: input.action, category: input.category },
      "[Audit] Failed to create audit log",
    );
  }
}