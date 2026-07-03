"use server";

import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";

import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { NotFoundError } from "@/lib/http-errors";
import {
  isOfferActive,
  offerAppliesToTier,
  pickBestOffer,
  type PurchasableTicketType,
} from "@/lib/pricing";
import { OfferSchema, OfferListSchema } from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import { db } from "..";
import { offers } from "../schema";
import type { Offer } from "../schema";
import { requireAdminSession } from "./auth-guards";
import type { z } from "zod";

type OfferInput = z.infer<typeof OfferSchema>;
type OfferListInput = z.infer<typeof OfferListSchema>;

function activeOfferConditions(now: Date) {
  return and(
    eq(offers.isActive, true),
    or(isNull(offers.startsAt), lte(offers.startsAt, now)),
    or(isNull(offers.endsAt), gte(offers.endsAt, now)),
    or(isNull(offers.remainingSlots), sql`${offers.remainingSlots} > 0`),
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
    const { session } = await requireAdminSession();
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
    await requireAdminSession();
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

export async function listOffers(params: OfferListInput): Promise<
  ActionResponse<{
    items: Offer[];
    total: number;
    page: number;
    pageSize: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: OfferListSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await requireAdminSession();
    const { page, pageSize, status, search } = validationResult.params!;

    const condition = [];

    if (status !== "all") {
      condition.push(eq(offers.isActive, status === "active"));
    }

    if (search) {
      const term = `%${search.trim()}%`;
      condition.push(
        or(ilike(offers.title, term), ilike(offers.description, term)),
      );
    }

    const whereClause = condition.length ? and(...condition) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(offers)
      .where(whereClause);

    const items = await db
      .select()
      .from(offers)
      .where(whereClause)
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
export async function getOfferById(
  offerId: string,
): Promise<ActionResponse<Offer | null>> {
  try {
    await requireAdminSession();

    const [offer] = await db
      .select()
      .from(offers)
      .where(eq(offers.id, offerId))
      .limit(1);

    if (!offer) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: offer,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteOffer(
  id: string,
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  try {
    await requireAdminSession();

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
