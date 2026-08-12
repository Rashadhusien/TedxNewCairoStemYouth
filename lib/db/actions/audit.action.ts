"use server";

import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";

import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { AuditLogListSchema } from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";

import { db } from "..";
import { auditLogs } from "../schema";
import { requireAdminSession } from "./auth-guards";

export type AuditLogListInput = {
  category: string;
  status: string;
  search?: string;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
};

type AuditLogCategory = (typeof auditLogs.$inferSelect)["category"];
type AuditLogStatus = (typeof auditLogs.$inferSelect)["status"];

export async function listAuditLogs(params: AuditLogListInput): Promise<
  | ActionResponse<{
      items: (typeof auditLogs.$inferSelect)[];
      total: number;
      page: number;
      pageSize: number;
    }>
  | ErrorResponse
> {
  const validationResult = await action<AuditLogListInput>({
    params,
    schema: AuditLogListSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await requireAdminSession();

    const { category, status, search, from, to, page, pageSize } =
      validationResult.params as AuditLogListInput;

    const conditions = [];

    if (category && category !== "all") {
      conditions.push(eq(auditLogs.category, category as AuditLogCategory));
    }

    if (status && status !== "all") {
      conditions.push(eq(auditLogs.status, status as AuditLogStatus));
    }

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(auditLogs.summary, term),
          ilike(auditLogs.action, term),
          ilike(auditLogs.actorEmail, term),
          ilike(auditLogs.entityType, term),
          ilike(auditLogs.entityId, term),
        ),
      );
    }

    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) {
        conditions.push(gte(auditLogs.createdAt, fromDate));
      }
    }

    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        conditions.push(lte(auditLogs.createdAt, toDate));
      }
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(whereClause);

    const items = await db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      success: true,
      data: {
        items,
        total: countRow?.count ?? 0,
        page,
        pageSize,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}