"use server";

import { and, eq, gte, isNull, lte, ne, or, sql } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  computeFinalPrice,
  couponAppliesToTier,
  isCouponActive,
  pickBestOffer,
  type PurchasableTicketType,
} from "@/lib/pricing";
import { piastresToKashierAmount, createKashierSession } from "@/lib/kashier";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import { KashierCheckoutSchema } from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import type { z } from "zod";

import { db } from "..";
import { coupons, offers, tickets, users } from "../schema";

type KashierCheckoutInput = z.infer<typeof KashierCheckoutSchema>;

export async function createKashierCheckoutSession(
  params: KashierCheckoutInput,
): Promise<
  ActionResponse<{ sessionUrl: string; ticketId: string }> | ErrorResponse
> {
  const validationResult = await action<KashierCheckoutInput>({
    params,
    schema: KashierCheckoutSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const session = validationResult.session!;
  const data = validationResult.params as KashierCheckoutInput;

  try {
    const rateLimitResult = await checkRateLimit(
      "kashier-checkout",
      session.user.id,
    );
    if (!rateLimitResult.success) {
      return handleError(
        new ValidationError({
          rateLimit: [
            `Too many checkout attempts. Try again in ${rateLimitResult.retryAfterSeconds} seconds.`,
          ],
        }),
      ) as ErrorResponse;
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        dataConsentGiven: users.dataConsentGiven,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return handleError(new NotFoundError("User")) as ErrorResponse;
    }

    if (!user.dataConsentGiven) {
      return handleError(
        new ValidationError({
          dataConsent: [
            "You must accept data consent before purchasing a ticket",
          ],
        }),
      ) as ErrorResponse;
    }

    const [existingTicket] = await db
      .select()
      .from(tickets)
      .where(
        and(
          eq(tickets.userId, session.user.id),
          ne(tickets.status, "cancelled"),
        ),
      )
      .limit(1);

    if (
      existingTicket &&
      existingTicket.status !== "pending_payment" &&
      existingTicket.status !== "rejected"
    ) {
      return handleError(
        new ValidationError({
          ticket: ["You already have an active ticket"],
        }),
      ) as ErrorResponse;
    }

    const currentDate = new Date();
    const activeOffers = await db
      .select()
      .from(offers)
      .where(
        and(
          eq(offers.isActive, true),
          or(isNull(offers.startsAt), lte(offers.startsAt, currentDate)),
          or(isNull(offers.endsAt), gte(offers.endsAt, currentDate)),
          or(isNull(offers.remainingSlots), sql`${offers.remainingSlots} > 0`),
        ),
      );

    const bestOffer = pickBestOffer(
      activeOffers,
      data.ticketType as PurchasableTicketType,
    );

    let coupon = null;
    if (data.couponCode?.trim()) {
      const [couponRow] = await db
        .select()
        .from(coupons)
        .where(sql`LOWER(${coupons.code}) = LOWER(${data.couponCode.trim()})`)
        .limit(1);

      coupon = couponRow ?? null;

      if (!coupon) {
        return handleError(
          new ValidationError({ couponCode: ["Invalid coupon code"] }),
        ) as ErrorResponse;
      }

      if (!isCouponActive(coupon)) {
        return handleError(
          new ValidationError({ couponCode: ["Coupon is no longer active"] }),
        ) as ErrorResponse;
      }

      if (
        !couponAppliesToTier(coupon, data.ticketType as PurchasableTicketType)
      ) {
        return handleError(
          new ValidationError({
            couponCode: ["Coupon does not apply to this ticket tier"],
          }),
        ) as ErrorResponse;
      }
    }

    const breakdown = computeFinalPrice(
      data.ticketType as PurchasableTicketType,
      bestOffer,
      coupon,
    );

    const now = new Date();

    const ticketValues = {
      userId: session.user.id,
      type: data.ticketType as PurchasableTicketType,
      status: "pending_payment" as const,
      pricePaid: breakdown.finalPrice,
      paymentMethod: "kashier_card",
      paymentGatewayOrderId: null,
      paymentScreenshotUrl: null,
      paymentSenderName: null,
      paymentSenderPhone: null,
      paymentTransactionRef: null,
      paymentNotes: null,
      paymentSubmittedAt: null,
      couponId: breakdown.couponId,
      couponDiscountApplied: breakdown.couponDiscountApplied,
      offerId: breakdown.offerId,
      offerPriceApplied: breakdown.offerPriceApplied,
      rejectionReason: null,
      reviewedAt: null,
      reviewedBy: null,
      updatedAt: now,
    };

    let resultTicketId: string;

    if (existingTicket) {
      const [updated] = await db
        .update(tickets)
        .set(ticketValues)
        .where(eq(tickets.id, existingTicket.id))
        .returning({ id: tickets.id });

      resultTicketId = updated.id;
    } else {
      const [created] = await db
        .insert(tickets)
        .values(ticketValues)
        .returning({ id: tickets.id });

      resultTicketId = created.id;
    }

    if (breakdown.couponId && existingTicket?.couponId !== breakdown.couponId) {
      await db
        .update(coupons)
        .set({
          usedCount: sql`${coupons.usedCount} + 1`,
          updatedAt: now,
        })
        .where(eq(coupons.id, breakdown.couponId));
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const kashierAmount = piastresToKashierAmount(breakdown.finalPrice);

    const kashierSession = await createKashierSession({
      order: resultTicketId,
      amount: kashierAmount,
      currency: "EGP",
      merchantRedirect: `${appUrl}/tickets/success?orderId=${resultTicketId}`,
      serverWebhook: `${appUrl}/api/webhooks/kashier`,
      allowedMethods: "card,wallet",
      display: "en",
      description: `TEDx Ticket Purchase - ${data.ticketType}`,
      customer: {
        email: user.email,
        reference: user.id,
      },
    });

    await db
      .update(tickets)
      .set({
        paymentGatewayOrderId: resultTicketId,
        paymentSubmittedAt: now,
        updatedAt: now,
      })
      .where(eq(tickets.id, resultTicketId));

    return {
      success: true,
      data: {
        sessionUrl: kashierSession.sessionUrl,
        ticketId: resultTicketId,
      },
    };
  } catch (error) {
    console.error("[Kashier] Checkout session creation failed:", error);
    return handleError(error) as ErrorResponse;
  }
}
