"use server";

import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "..";
import { offers } from "../schema";
import { requireAdminSession } from "./auth-guards";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import { actorFromSession, createAuditLog } from "@/lib/db/audit";

/**
 * Seed/update offers with featured status and pricing
 * This action updates existing offers to be featured with proper pricing
 */
export async function seedOffers(): Promise<
  ActionResponse<{ count: number }> | ErrorResponse
> {
  try {
    const { session } = await requireAdminSession();

    // Update or create early bird offer
    const [earlyBird] = await db
      .insert(offers)
      .values({
        title: "Early Bird Special",
        description:
          "Get your ticket at a special early bird price before the event! Limited time offer.",
        type: "early_bird",
        discountedPrice: 30000, // 300.00 EGP
        originalPrice: 35000, // 350.00 EGP
        isFeatured: true,
        isActive: true,
        displayOrder: 0,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdBy: session.user.id,
        updatedAt: new Date(),
      })
      .onConflictDoNothing()
      .returning();

    // Update or create flash sale offer
    const [flashSale] = await db
      .insert(offers)
      .values({
        title: "Flash Sale - Limited Time",
        description:
          "Limited time offer! Only a few tickets left at this price.",
        type: "promotional",
        discountedPrice: 28000, // 280.00 EGP
        originalPrice: 35000, // 350.00 EGP
        isFeatured: true,
        isActive: true,
        displayOrder: 1,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        badgeLabel: "🔥 Only 50 left!",
        remainingSlots: 50,
        createdBy: session.user.id,
        updatedAt: new Date(),
      })
      .onConflictDoNothing()
      .returning();

    // Update any existing offers to be featured if they don't have pricing
    const updated = await db
      .update(offers)
      .set({
        isFeatured: true,
        discountedPrice: 30000,
        originalPrice: 35000,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(offers.isActive, true),
          or(isNull(offers.discountedPrice), eq(offers.discountedPrice, 0)),
        ),
      )
      .returning();

    const count = (earlyBird ? 1 : 0) + (flashSale ? 1 : 0) + updated.length;

    void createAuditLog({
      category: "admin",
      action: "offer.seed",
      ...actorFromSession(session),
      entityType: "offer",
      summary: `Seeded featured offers (${count} upserted)`,
      metadata: { count },
    });

    return {
      success: true,
      data: { count },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Update a specific offer to be featured with pricing
 */
export async function updateOfferFeatured(
  offerId: string,
  params: {
    isFeatured: boolean;
    discountedPrice?: number | null;
    originalPrice?: number | null;
  },
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  const validationResult = await action({ params });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const { session } = await requireAdminSession();
    const data = validationResult.params as typeof params;

    const [updated] = await db
      .update(offers)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(offers.id, offerId))
      .returning({ id: offers.id });

    if (!updated) {
      return handleError(new Error("Offer not found")) as ErrorResponse;
    }

    void createAuditLog({
      category: "admin",
      action: "offer.update_featured",
      ...actorFromSession(session),
      entityType: "offer",
      entityId: updated.id,
      summary: `Set featured ${data.isFeatured} for offer ${updated.id}`,
      metadata: {
        isFeatured: data.isFeatured,
        discountedPrice: data.discountedPrice ?? null,
        originalPrice: data.originalPrice ?? null,
      },
    });

    return { success: true, data: { id: updated.id } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
