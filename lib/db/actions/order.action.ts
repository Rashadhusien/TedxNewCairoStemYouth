"use server";

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import { piastresToKashierAmount, createKashierSession } from "@/lib/kashier";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import { CreateOrderSchema, OrderListSchema } from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import type { z } from "zod";
import { notifyTicketConfirmed } from "@/lib/email/send-ticket-emails";

import { db } from "..";
import { orders, tickets, users, promoCodeUsages } from "../schema";
import { assertUserIsActive, requireAdminSession } from "./auth-guards";
import {
  getPromoCodeByCode,
  incrementPromoCodeUsage,
  decrementPromoCodeUsage,
} from "./promo-code.action";
import { getPackageById } from "./package.action";
import { serverAnalytics } from "@/lib/analytics/server";

type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
type OrderListInput = z.infer<typeof OrderListSchema>;

// Promo reservation expiration window (15 minutes)
const PROMO_RESERVATION_MINUTES = 15;

export async function getOrderById(id: string) {
  const validationResult = await action({ authorize: true });
  if (validationResult instanceof Error) {
    return null;
  }

  const session = validationResult.session!;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  // Only return order if user owns it or is admin
  if (!order) return null;

  const isAdmin =
    session.user.role === "admin" || session.user.role === "organizer";
  if (order.userId !== session.user.id && !isAdmin) {
    return null;
  }

  return order;
}

export async function getOrderWithTickets(id: string) {
  const validationResult = await action({ authorize: true });
  if (validationResult instanceof Error) {
    return null;
  }

  const session = validationResult.session!;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) return null;

  // Only return order if user owns it or is admin
  const isAdmin =
    session.user.role === "admin" || session.user.role === "organizer";
  if (order.userId !== session.user.id && !isAdmin) {
    return null;
  }

  const orderTickets = await db
    .select()
    .from(tickets)
    .where(eq(tickets.orderId, id));

  return { order, tickets: orderTickets };
}

// Internal version for webhooks (no auth check)
export async function getOrderByIdInternal(id: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  return order ?? null;
}

// Internal version for webhooks (no auth check)
export async function getOrderWithTicketsInternal(id: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) return null;

  const orderTickets = await db
    .select()
    .from(tickets)
    .where(eq(tickets.orderId, id));

  return { order, tickets: orderTickets };
}

export async function listOrders(
  params: OrderListInput,
): Promise<
  | ActionResponse<{ orders: (typeof orders.$inferSelect)[]; total: number }>
  | ErrorResponse
> {
  try {
    const { status, search, page, pageSize } = params;

    const conditions = [];

    if (status !== "all") {
      conditions.push(eq(orders.status, status));
    }

    if (search) {
      conditions.push(
        or(
          ilike(orders.packageName, `%${search}%`),
          ilike(orders.promoCode || "", `%${search}%`),
          ilike(orders.accessCode || "", `%${search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(whereClause ?? sql`1=1`);

    const total = countResult?.count || 0;

    const orderList = await db
      .select()
      .from(orders)
      .where(whereClause ?? sql`1=1`)
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      success: true,
      data: {
        orders: orderList,
        total,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createOrder(
  params: CreateOrderInput,
): Promise<
  ActionResponse<{ orderId: string; sessionUrl?: string }> | ErrorResponse
> {
  const validationResult = await action<CreateOrderInput>({
    params,
    schema: CreateOrderSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const session = validationResult.session!;
  const data = validationResult.params as CreateOrderInput;

  try {
    await assertUserIsActive(session.user.id);

    const rateLimitResult = await checkRateLimit(
      "kashier-checkout",
      session.user.id,
    );
    if (!rateLimitResult.success) {
      return handleError(
        new ValidationError({
          rateLimit: [
            `Too many order attempts. Try again in ${rateLimitResult.retryAfterSeconds} seconds.`,
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

    // Get package
    const pkg = await getPackageById(data.packageId);
    if (!pkg) {
      return handleError(new NotFoundError("Package")) as ErrorResponse;
    }

    if (!pkg.isActive) {
      return handleError(
        new ValidationError({ package: ["This package is not available"] }),
      ) as ErrorResponse;
    }

    // Validate access code if required
    if (pkg.requiresAccessCode) {
      if (!data.accessCode || data.accessCode.trim() === "") {
        return handleError(
          new ValidationError({
            accessCode: ["Access code is required for this package"],
          }),
        ) as ErrorResponse;
      }
      if (data.accessCode.trim() !== "N/A") {
        // Basic validation - could be extended if needed
        if (data.accessCode.trim().length < 3) {
          return handleError(
            new ValidationError({ accessCode: ["Invalid access code"] }),
          ) as ErrorResponse;
        }
      }
    }

    // Validate attendee count matches package
    if (data.attendees.length !== pkg.ticketCount) {
      return handleError(
        new ValidationError({
          attendees: [
            `This package requires exactly ${pkg.ticketCount} attendee(s)`,
          ],
        }),
      ) as ErrorResponse;
    }

    // Validate promo code if provided
    let promoCode = null;
    let discountPiastres = 0;
    let finalAmountPiastres = pkg.totalPricePiastres;

    if (data.promoCode && data.promoCode.trim()) {
      promoCode = await getPromoCodeByCode(data.promoCode.trim());

      if (!promoCode) {
        return handleError(
          new ValidationError({ promoCode: ["Invalid promo code"] }),
        ) as ErrorResponse;
      }

      if (!promoCode.isActive) {
        return handleError(
          new ValidationError({ promoCode: ["Promo code is inactive"] }),
        ) as ErrorResponse;
      }

      const now = new Date();
      if (promoCode.validFrom && promoCode.validFrom > now) {
        return handleError(
          new ValidationError({ promoCode: ["Promo code is not yet valid"] }),
        ) as ErrorResponse;
      }

      if (promoCode.validUntil && promoCode.validUntil < now) {
        return handleError(
          new ValidationError({ promoCode: ["Promo code has expired"] }),
        ) as ErrorResponse;
      }

      if (
        promoCode.maxUses !== null &&
        promoCode.usedCount >= promoCode.maxUses
      ) {
        return handleError(
          new ValidationError({
            promoCode: ["Promo code has reached maximum usage limit"],
          }),
        ) as ErrorResponse;
      }

      // Promo codes only apply to packages where isPromoApplicable is true
      if (!pkg.isPromoApplicable) {
        // For non-promo-applicable packages, record the promo code but don't apply discount
        // The promo code will still be saved for usage tracking (discount remains 0)
      } else {
        // Apply promo discount for promo-applicable packages
        if (promoCode.type === "fixed_price") {
          finalAmountPiastres = promoCode.valuePiastres;
          discountPiastres = pkg.totalPricePiastres - finalAmountPiastres;
        } else if (promoCode.type === "discount") {
          discountPiastres = promoCode.valuePiastres;
          finalAmountPiastres = Math.max(
            0,
            pkg.totalPricePiastres - discountPiastres,
          );
        } else if (promoCode.type === "free") {
          discountPiastres = pkg.totalPricePiastres;
          finalAmountPiastres = 0;
        }
      }
    }

    // Reserve promo capacity if applicable (atomic check-then-act)
    let promoReservationExpiresAt = null;
    if (promoCode) {
      try {
        await incrementPromoCodeUsage(promoCode.id);
        promoReservationExpiresAt = new Date(
          Date.now() + PROMO_RESERVATION_MINUTES * 60 * 1000,
        );
      } catch {
        return handleError(
          new ValidationError({
            promoCode: ["Promo code has reached maximum usage limit"],
          }),
        ) as ErrorResponse;
      }
    }

    // Handle free promo - skip Kashier and mark as paid immediately
    if (finalAmountPiastres === 0) {
      const now = new Date();

      // Use transaction for free order
      const result = await db.transaction(async (tx) => {
        // Create order with paid status
        const [order] = await tx
          .insert(orders)
          .values({
            userId: session.user.id,
            packageId: pkg.id,
            status: "paid",
            paidAt: now,
            originalAmountPiastres: pkg.totalPricePiastres,
            discountPiastres,
            finalAmountPiastres,
            packageName: pkg.name,
            packageTicketCount: pkg.ticketCount,
            packagePricePerTicketPiastres: pkg.pricePerTicketPiastres,
            promoCodeId: promoCode?.id,
            promoCode: data.promoCode?.trim() || null,
            promoReservationExpiresAt: null, // No reservation needed for free orders
            accessCode: data.accessCode?.trim() || null,
            createdAt: now,
            updatedAt: now,
          })
          .returning({ id: orders.id });

        const orderId = order.id;

        // Create confirmed tickets
        const ticketIds = [];
        for (const attendee of data.attendees) {
          const [ticket] = await tx
            .insert(tickets)
            .values({
              userId: session.user.id,
              orderId: orderId,
              type: "general",
              status: "confirmed",
              pricePaid: 0,
              currency: "EGP",
              paymentMethod: "free_promo",
              attendeeName: attendee.name,
              attendeeEmail: attendee.email,
              attendeePhone: attendee.phone,
              reviewedAt: now,
              createdAt: now,
              updatedAt: now,
            })
            .returning({ id: tickets.id, qrCode: tickets.qrCode });

          ticketIds.push({
            id: ticket.id,
            qrCode: ticket.qrCode,
            attendeeName: attendee.name,
            attendeeEmail: attendee.email,
          });
        }

        // Create promo usage record if promo was used
        if (promoCode) {
          await tx.insert(promoCodeUsages).values({
            promoCodeId: promoCode.id,
            orderId: orderId,
            originalAmountPiastres: pkg.totalPricePiastres,
            discountPiastres,
            finalAmountPiastres,
            usedAt: now,
          });
        }

        return { orderId, ticketIds };
      });

      // Send confirmation emails (fire-and-forget)
      for (const ticket of result.ticketIds) {
        notifyTicketConfirmed({
          ticketId: ticket.id,
          attendeeName: ticket.attendeeName,
          attendeeEmail: ticket.attendeeEmail,
          ticketType: "general",
          pricePaid: 0,
          qrCode: ticket.qrCode,
        });
      }

      return {
        success: true,
        data: { orderId: result.orderId },
      };
    }

    // Create order with pricing snapshot (transactional)
    const now = new Date();

    const orderId = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          userId: session.user.id,
          packageId: pkg.id,
          status: "pending_payment",
          originalAmountPiastres: pkg.totalPricePiastres,
          discountPiastres,
          finalAmountPiastres,
          packageName: pkg.name,
          packageTicketCount: pkg.ticketCount,
          packagePricePerTicketPiastres: pkg.pricePerTicketPiastres,
          promoCodeId: promoCode?.id,
          promoCode: data.promoCode?.trim() || null,
          promoReservationExpiresAt,
          accessCode: data.accessCode?.trim() || null,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: orders.id });

      const newOrderId = order.id;

      // Store attendee information temporarily in tickets with pending status
      // These will be converted to confirmed tickets after payment
      for (const attendee of data.attendees) {
        await tx.insert(tickets).values({
          userId: session.user.id,
          orderId: newOrderId,
          type: "general",
          status: "pending_payment",
          pricePaid: pkg.pricePerTicketPiastres,
          currency: "EGP",
          paymentMethod: "kashier_card",
          attendeeName: attendee.name,
          attendeeEmail: attendee.email,
          attendeePhone: attendee.phone,
          createdAt: now,
          updatedAt: now,
        });
      }

      return newOrderId;
    });

    // Create Kashier session (outside transaction)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const kashierAmount = piastresToKashierAmount(finalAmountPiastres);

    const kashierSession = await createKashierSession({
      order: orderId,
      amount: kashierAmount,
      currency: "EGP",
      merchantRedirect: `${appUrl}/tickets/success?orderId=${orderId}`,
      serverWebhook: `${appUrl}/api/webhooks/kashier`,
      allowedMethods: "card,wallet",
      display: "en",
      description: `TEDx Package Purchase - ${pkg.name}`,
      customer: {
        email: user.email,
        reference: user.id,
      },
    });

    // Update order with Kashier session ID
    await db
      .update(orders)
      .set({
        kashierSessionId: kashierSession.sessionId,
        kashierOrderId: kashierSession.sessionId,
        updatedAt: now,
      })
      .where(eq(orders.id, orderId));

    serverAnalytics.capture("ticket_checkout_started", session.user.id, {
      ticket_type: pkg.name,
      price_piastres: finalAmountPiastres,
    });

    return {
      success: true,
      data: {
        orderId,
        sessionUrl: kashierSession.sessionUrl,
      },
    };
  } catch (error) {
    console.error("[Order] Creation failed:", error);
    return handleError(error) as ErrorResponse;
  }
}

export async function cleanupExpiredPromoReservations() {
  const now = new Date();

  const expiredOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.status, "pending_payment"),
        sql`${orders.promoReservationExpiresAt} IS NOT NULL`,
        sql`${orders.promoReservationExpiresAt} < ${now}`,
      ),
    );

  for (const order of expiredOrders) {
    if (order.promoCodeId) {
      await decrementPromoCodeUsage(order.promoCodeId);
    }

    await db
      .update(orders)
      .set({
        promoReservationExpiresAt: null,
        updatedAt: now,
      })
      .where(eq(orders.id, order.id));
  }

  return { cleaned: expiredOrders.length };
}

export async function cancelOrder(
  id: string,
  reason?: string,
): Promise<ActionResponse<{ orderId: string }> | ErrorResponse> {
  try {
    await requireAdminSession();

    const order = await getOrderById(id);
    if (!order) {
      return handleError(new NotFoundError("Order")) as ErrorResponse;
    }

    if (order.status === "cancelled") {
      return handleError(
        new ValidationError({ order: ["Order is already cancelled"] }),
      ) as ErrorResponse;
    }

    if (order.status === "paid") {
      return handleError(
        new ValidationError({ order: ["Cannot cancel a paid order"] }),
      ) as ErrorResponse;
    }

    // Release promo reservation if applicable
    if (order.promoCodeId && order.promoReservationExpiresAt) {
      await decrementPromoCodeUsage(order.promoCodeId);
    }

    await db
      .update(orders)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: reason,
        promoReservationExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    return {
      success: true,
      data: { orderId: id },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
