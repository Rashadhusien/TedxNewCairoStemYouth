"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { TicketLimitSettingSchema } from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import type { z } from "zod";

import { db } from "..";
import { appSettings, tickets } from "../schema";
import { requireAdminSession } from "./auth-guards";
import { ROUTES } from "@/constants/routes";

type TicketLimitSettingInput = z.infer<typeof TicketLimitSettingSchema>;

const MAX_TOTAL_TICKETS_KEY = "max_total_tickets";

export async function getTicketLimitSetting(): Promise<{
  maxTotalTickets: number;
  totalTicketsSold: number;
  remainingTickets: number;
}> {
  const [setting] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, MAX_TOTAL_TICKETS_KEY))
    .limit(1);

  const maxTotalTickets = setting ? Number(setting.value) : 500;

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tickets)
    .where(inArray(tickets.status, ["confirmed", "checked_in"]));

  const totalTicketsSold = countRow?.count ?? 0;

  return {
    maxTotalTickets,
    totalTicketsSold,
    remainingTickets: Math.max(0, maxTotalTickets - totalTicketsSold),
  };
}

export async function updateTicketLimitSetting(
  params: TicketLimitSettingInput,
): Promise<
  ActionResponse<{ maxTotalTickets: number }> | ErrorResponse
> {
  const validationResult = await action<TicketLimitSettingInput>({
    params,
    schema: TicketLimitSettingSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const session = validationResult.session!;
  const data = validationResult.params as TicketLimitSettingInput;

  try {
    await requireAdminSession();

    await db
      .insert(appSettings)
      .values({
        key: MAX_TOTAL_TICKETS_KEY,
        value: String(data.maxTotalTickets),
        updatedBy: session.user.id,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: {
          value: String(data.maxTotalTickets),
          updatedBy: session.user.id,
          updatedAt: new Date(),
        },
      });

    revalidatePath(ROUTES.ADMIN.SETTINGS.TICKET_LIMIT);

    return {
      success: true,
      data: { maxTotalTickets: data.maxTotalTickets },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
