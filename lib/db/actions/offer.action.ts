"use server";

import { and, asc, desc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";

import { auth } from "@/auth";
import { isAdminRole } from "@/lib/auth/route-guards";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { ForbiddenError, NotFoundError } from "@/lib/http-errors";
import {
  isOfferActive,
  offerAppliesToTier,
  pickBestOffer,
  type PurchasableTicketType,
} from "@/lib/pricing";
import { OfferSchema, TicketListSchema } from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import type { z } from "zod";

type OfferInput = z.infer<typeof OfferSchema>;

import { db } from "..";
import { offers } from "../schema";
import type { Offer } from "../schema";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    throw new ForbiddenError("Admin access required");
  }
  return session;
}

function activeOfferConditions(now: Date) {
  return and(
    eq(offers.isActive, true),
    or(isNull(offers.startsAt), lte(offers.startsAt, now)),
    or(isNull(offers.endsAt), gte(offers.endsAt, now)),
    or(
      isNull(offers.remainingSlots),
      sql`${offers.remainingSlots} > 0`,
    ),
  );
}

export async function getActiveOffers(
  featuredOnly = false,
): Promise<ActionResponse<Offer[]>> {
  try {
    const now = new Date();
    const conditions = featuredOnly
      ? and(activeOfferConditions(now), eq(offers.isFeatured, true))
      : activeOfferConditions(now);

    const items = await db
      .select()
      .from(offers)
      .where(conditions)
      .orderBy(asc(offers.displayOrder), desc(offers.createdAt));

    return { success: true, data: items };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getBestOfferForTier(
  ticketType: PurchasableTicketType,
): Promise<Offer | null> {
  const result = await getActiveOffers();
  if (!result.success || !result.data) return null;
  return pickBestOffer(result.data, ticketType);
}

export async function createOffer(
  params: OfferInput,
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  const validationResult = await action<OfferInput>({
    params,
    schema: OfferSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const session = await requireAdmin();
    const data = validationResult.params as OfferInput;

    const [created] = await db
      .insert(offers)
      .values({
        ...data,
        createdBy: session.user.id,
        updatedAt: new Date(),
      })
      .returning({ id: offers.id });

    return { success: true, data: { id: created.id } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateOffer(
  params: { id: string } & OfferInput,
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  const { id, ...rest } = params;
  const validationResult = await action<OfferInput>({
    params: rest,
    schema: OfferSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await requireAdmin();
    const data = validationResult.params as OfferInput;

    const [updated] = await db
      .update(offers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(offers.id, id))
      .returning({ id: offers.id });

    if (!updated) {
      return handleError(new NotFoundError("Offer")) as ErrorResponse;
    }

    return { success: true, data: { id: updated.id } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function listOffers(
  params: { page?: number; pageSize?: number } = {},
): Promise<
  ActionResponse<{
    items: Offer[];
    total: number;
    page: number;
    pageSize: number;
  }>
> {
  const validationResult = await action({
    params: {
      status: "all" as const,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 50,
      search: undefined,
    },
    schema: TicketListSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await requireAdmin();
    const { page, pageSize } = validationResult.params!;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(offers);

    const items = await db
      .select()
      .from(offers)
      .orderBy(asc(offers.displayOrder), desc(offers.createdAt))
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

export async function deleteOffer(
  id: string,
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  try {
    await requireAdmin();

    const [updated] = await db
      .update(offers)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(offers.id, id))
      .returning({ id: offers.id });

    if (!updated) {
      return handleError(new NotFoundError("Offer")) as ErrorResponse;
    }

    return { success: true, data: { id: updated.id } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export { isOfferActive, offerAppliesToTier };
