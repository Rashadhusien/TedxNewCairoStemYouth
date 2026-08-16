"use server";

import { eq, inArray, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { TicketLimitSettingSchema } from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import type { z } from "zod";

import { db } from "..";
import { appSettings, tickets, promoCodes, orders } from "../schema";
import { requireAdminSession } from "./auth-guards";
import { ROUTES } from "@/constants/routes";
import { actorFromSession, createAuditLog } from "@/lib/db/audit";

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

export interface TicketStatistics {
  totalTicketsSold: number;
  totalRevenue: number; // in EGP
  freeTickets: number;
  paidTickets: number;
  ticketsByStatus: Array<{ status: string; count: number; percentage: number }>;
  ticketsByPrice: Array<{ price: number; count: number; percentage: number }>;
  packagesDistribution: Array<{
    packageName: string;
    count: number;
    percentage: number;
  }>;
  promoCodeUsage: Array<{ code: string; count: number; totalDiscount: number }>;
  recentTickets: Array<{
    id: string;
    type: string;
    status: string;
    pricePaid: number;
    createdAt: Date;
    attendeeName: string | null;
  }>;
}

export async function getTicketStatistics(): Promise<TicketStatistics> {
  // Get total confirmed tickets
  const [totalTicketsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tickets)
    .where(inArray(tickets.status, ["confirmed", "checked_in"]));

  const totalTicketsSold = totalTicketsResult?.count ?? 0;

  // Get total revenue (sum of pricePaid for confirmed tickets)
  const [revenueResult] = await db
    .select({ total: sql<number>`coalesce(sum(price_paid), 0)::int` })
    .from(tickets)
    .where(inArray(tickets.status, ["confirmed", "checked_in"]));

  const totalRevenue = (revenueResult?.total ?? 0) / 100; // Convert piastres to EGP

  // Get free vs paid tickets
  const [freeTicketsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tickets)
    .where(
      sql`${tickets.status} in ('confirmed', 'checked_in') AND ${tickets.pricePaid} = 0`,
    );

  const freeTickets = freeTicketsResult?.count ?? 0;
  const paidTickets = totalTicketsSold - freeTickets;

  // Get packages distribution from orders - only count paid orders
  const packagesDistributionResult = await db
    .select({
      packageName: orders.packageName,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(eq(orders.status, "paid"))
    .groupBy(orders.packageName);

  const packagesDistribution = packagesDistributionResult.map((item) => ({
    packageName: item.packageName,
    count: item.count,
    percentage:
      totalTicketsSold > 0 ? (item.count / totalTicketsSold) * 100 : 0,
  }));

  // Get tickets by status
  const ticketsByStatusResult = await db
    .select({
      status: tickets.status,
      count: sql<number>`count(*)::int`,
    })
    .from(tickets)
    .groupBy(tickets.status);

  const ticketsByStatus = ticketsByStatusResult.map((item) => ({
    status: item.status,
    count: item.count,
    percentage:
      totalTicketsSold > 0 ? (item.count / totalTicketsSold) * 100 : 0,
  }));

  // Get tickets by price group
  const ticketsByPriceResult = await db
    .select({
      pricePaid: tickets.pricePaid,
      count: sql<number>`count(*)::int`,
    })
    .from(tickets)
    .where(inArray(tickets.status, ["confirmed", "checked_in"]))
    .groupBy(tickets.pricePaid)
    .orderBy(desc(tickets.pricePaid));

  const ticketsByPrice = ticketsByPriceResult.map((item) => ({
    price: item.pricePaid / 100, // Convert to EGP
    count: item.count,
    percentage:
      totalTicketsSold > 0 ? (item.count / totalTicketsSold) * 100 : 0,
  }));

  // Get promo code usage
  const promoCodeUsageResult = await db
    .select({
      code: promoCodes.code,
      count: sql<number>`count(*)::int`,
      totalDiscount: sql<number>`coalesce(sum(tickets.coupon_discount_applied), 0)::int`,
    })
    .from(tickets)
    .innerJoin(promoCodes, eq(tickets.couponId, promoCodes.id))
    .where(inArray(tickets.status, ["confirmed", "checked_in"]))
    .groupBy(promoCodes.code)
    .orderBy(desc(sql`count(*)`));

  const promoCodeUsage = promoCodeUsageResult.map((item) => ({
    code: item.code,
    count: item.count,
    totalDiscount: item.totalDiscount / 100, // Convert to EGP
  }));

  // Get all tickets
  const recentTickets = await db
    .select({
      id: tickets.id,
      type: tickets.type,
      status: tickets.status,
      pricePaid: tickets.pricePaid,
      createdAt: tickets.createdAt,
      attendeeName: tickets.attendeeName,
    })
    .from(tickets)
    .where(inArray(tickets.status, ["confirmed", "checked_in"]))
    .orderBy(desc(tickets.createdAt));

  return {
    totalTicketsSold,
    totalRevenue,
    freeTickets,
    paidTickets,
    ticketsByStatus,
    ticketsByPrice,
    packagesDistribution,
    promoCodeUsage,
    recentTickets: recentTickets.map((ticket) => ({
      ...ticket,
      pricePaid: ticket.pricePaid / 100, // Convert to EGP
    })),
  };
}

export async function updateTicketLimitSetting(
  params: TicketLimitSettingInput,
): Promise<ActionResponse<{ maxTotalTickets: number }> | ErrorResponse> {
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

    void createAuditLog({
      category: "admin",
      action: "setting.update_ticket_limit",
      ...actorFromSession(session),
      entityType: "app_setting",
      entityId: MAX_TOTAL_TICKETS_KEY,
      summary: `Updated max total tickets to ${data.maxTotalTickets}`,
      metadata: { maxTotalTickets: data.maxTotalTickets },
    });

    return {
      success: true,
      data: { maxTotalTickets: data.maxTotalTickets },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
