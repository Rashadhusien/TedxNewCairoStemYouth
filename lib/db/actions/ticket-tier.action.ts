"use server";

import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { NotFoundError } from "@/lib/http-errors";
import { ticketTierFormSchema, TicketTierListSchema } from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import type z from "zod";
import { db } from "..";
import { ticketTiers } from "../schema";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { requireAdminSession } from "./auth-guards";

type TicketTierInput = z.infer<typeof ticketTierFormSchema>;
type TicketTierListInput = z.infer<typeof TicketTierListSchema>;

export async function createTicketTier(
  params: TicketTierInput,
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  const validationResult = await action<TicketTierInput>({
    params,
    schema: ticketTierFormSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await requireAdminSession();
    const data = validationResult.params;

    if (!data) {
      return handleError(new Error("Invalid params")) as ErrorResponse;
    }

    const [created] = await db
      .insert(ticketTiers)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning({ id: ticketTiers.id });

    revalidatePath(ROUTES.HOME);
    revalidatePath(ROUTES.ADMIN.TICKET_TIERS.HOME);

    return { success: true, data: { id: created.id } };
  } catch (error) {
    console.error(error);
    return handleError(error) as ErrorResponse;
  }
}

export async function listTicketTiers(params: TicketTierListInput): Promise<
  | ActionResponse<{
      items: (typeof ticketTiers.$inferSelect)[];
      total: number;
      page: number;
      pageSize: number;
    }>
  | ErrorResponse
> {
  const validationResult = await action<TicketTierListInput>({
    params,
    schema: TicketTierListSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await requireAdminSession();
    const { status, search, page, pageSize } =
      validationResult.params as TicketTierListInput;

    const conditions = [];
    if (status !== "all") {
      conditions.push(eq(ticketTiers.isActive, status === "active"));
    }
    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(ilike(ticketTiers.label, term), ilike(ticketTiers.subtitle, term)),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ticketTiers)
      .where(whereClause);

    const rows = await db
      .select()
      .from(ticketTiers)
      .where(whereClause)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(ticketTiers.displayOrder, ticketTiers.type);

    return {
      success: true,
      data: { items: rows, total: countRow?.count ?? 0, page, pageSize },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getTicketTierById(
  ticketTierId: string,
): Promise<ActionResponse<typeof ticketTiers.$inferSelect | null>> {
  try {
    await requireAdminSession();

    const [ticketTier] = await db
      .select()
      .from(ticketTiers)
      .where(eq(ticketTiers.id, ticketTierId))
      .limit(1);

    if (!ticketTier) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: ticketTier,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateTicketTier(
  params: {
    id: string;
  } & TicketTierInput,
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  const { id, ...rest } = params;

  const validationResult = await action<TicketTierInput>({
    params: rest,
    schema: ticketTierFormSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await requireAdminSession();

    const data = validationResult.params as TicketTierInput;

    const [update] = await db
      .update(ticketTiers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ticketTiers.id, id))
      .returning({ id: ticketTiers.id });

    if (!update) {
      return handleError(new NotFoundError("Ticket Tier")) as ErrorResponse;
    }

    return { success: true, data: { id: update.id } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

// public - fetches active ticket tiers for the public ticket page
export async function getActiveTicketTiers(): Promise<
  | ActionResponse<{
      items: (typeof ticketTiers.$inferSelect)[];
    }>
  | ErrorResponse
> {
  try {
    const rows = await db
      .select()
      .from(ticketTiers)
      .where(eq(ticketTiers.isActive, true))
      .orderBy(ticketTiers.displayOrder, ticketTiers.type);

    return {
      success: true,
      data: { items: rows },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
