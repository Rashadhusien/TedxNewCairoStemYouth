"use server";

import {
  and,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { auth } from "@/auth";
import { isAdminRole } from "@/lib/auth/route-guards";
import { deletePaymentScreenshot } from "@/lib/cloudinary";
import {
  notifyTicketConfirmed,
  notifyTicketRejected,
  notifyTicketSubmitted,
} from "@/lib/email/send-ticket-emails";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import {
  computeFinalPrice,
  couponAppliesToTier,
  isCouponActive,
  pickBestOffer,
  type PurchasableTicketType,
} from "@/lib/pricing";
import {
  CheckInSchema,
  TicketListSchema,
  TicketPurchaseSchema,
  TicketReviewSchema,
} from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import type { MyTicketData, TicketWithRelations } from "@/types/ticket";
import type { z } from "zod";

type TicketPurchaseInput = z.infer<typeof TicketPurchaseSchema>;
type TicketListInput = z.infer<typeof TicketListSchema>;
type TicketReviewInput = z.infer<typeof TicketReviewSchema>;
type CheckInInput = z.infer<typeof CheckInSchema>;

import { db } from "..";
import { coupons, offers, orders, tickets, users } from "../schema";
import type { Ticket } from "../schema";
import { assertUserIsActive, requireAdminSession } from "./auth-guards";
import { serverAnalytics } from "@/lib/analytics/server";

async function resolveCoupon(code: string | undefined) {
  if (!code?.trim()) return null;

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(ilike(coupons.code, code.trim()))
    .limit(1);

  return coupon ?? null;
}

export async function purchaseTicket(
  params: TicketPurchaseInput,
): Promise<
  ActionResponse<{ ticketId: string; status: string }> | ErrorResponse
> {
  const validationResult = await action<TicketPurchaseInput>({
    params,
    schema: TicketPurchaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const session = validationResult.session!;
  const data = validationResult.params as TicketPurchaseInput;

  serverAnalytics.capture("ticket_checkout_started", session.user.id, {
    ticket_type: data.ticketType,
    price_piastres: 0,
  });

  try {
    await assertUserIsActive(session.user.id);

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

    const coupon = await resolveCoupon(data.couponCode);

    if (data.couponCode && !coupon) {
      return handleError(
        new ValidationError({ couponCode: ["Invalid coupon code"] }),
      ) as ErrorResponse;
    }

    if (coupon) {
      if (!isCouponActive(coupon)) {
        serverAnalytics.capture("coupon_rejected", session.user.id, {
          coupon_code: coupon.code,
          reason: "expired",
          ticket_type: data.ticketType,
        });
        return handleError(
          new ValidationError({ couponCode: ["Coupon is no longer active"] }),
        ) as ErrorResponse;
      }

      if (
        !couponAppliesToTier(coupon, data.ticketType as PurchasableTicketType)
      ) {
        serverAnalytics.capture("coupon_rejected", session.user.id, {
          coupon_code: coupon.code,
          reason: "not_applicable",
          ticket_type: data.ticketType,
        });
        return handleError(
          new ValidationError({
            couponCode: ["Coupon does not apply to this ticket tier"],
          }),
        ) as ErrorResponse;
      }

      serverAnalytics.capture("coupon_applied", session.user.id, {
        coupon_code: coupon.code,
        discount_type: coupon.type,
        discount_value:
          coupon.type === "fixed"
            ? coupon.discountAmount
            : coupon.percentageOff,
        ticket_type: data.ticketType,
      });
    } else if (data.couponCode) {
      serverAnalytics.capture("coupon_rejected", session.user.id, {
        coupon_code: data.couponCode,
        reason: "not_found",
        ticket_type: data.ticketType,
      });
    }

    const breakdown = computeFinalPrice(
      data.ticketType as PurchasableTicketType,
      bestOffer,
      coupon,
    );

    serverAnalytics.capture("ticket_checkout_started", session.user.id, {
      ticket_type: data.ticketType,
      price_piastres: breakdown.finalPrice,
    });

    const now = new Date();
    const ticketValues = {
      userId: session.user.id,
      type: data.ticketType as PurchasableTicketType,
      status: "payment_submitted" as const,
      pricePaid: breakdown.finalPrice,
      paymentMethod: data.paymentMethod,
      paymentScreenshotUrl: data.screenshotUrl,
      paymentSenderName: data.senderName,
      paymentSenderPhone: data.senderPhone,
      paymentTransactionRef: data.transactionRef ?? null,
      paymentNotes: data.notes ?? null,
      paymentSubmittedAt: now,
      couponId: breakdown.couponId,
      couponDiscountApplied: breakdown.couponDiscountApplied,
      offerId: breakdown.offerId,
      offerPriceApplied: breakdown.offerPriceApplied,
      rejectionReason: null,
      reviewedAt: null,
      reviewedBy: null,
      updatedAt: now,
    };

    let ticketId: string;

    if (existingTicket) {
      if (existingTicket.paymentScreenshotUrl && data.screenshotPublicId) {
        const folderPrefix = `tedx/payment_screenshots/${session.user.id}/`;
        if (
          data.screenshotPublicId.startsWith(folderPrefix.replace(/\/$/, "")) ||
          data.screenshotPublicId.includes(session.user.id)
        ) {
          try {
            await deletePaymentScreenshot(data.screenshotPublicId);
          } catch {
            // Non-blocking cleanup
          }
        }
      }

      const [updated] = await db
        .update(tickets)
        .set(ticketValues)
        .where(eq(tickets.id, existingTicket.id))
        .returning({ id: tickets.id });

      ticketId = updated.id;
    } else {
      const [created] = await db
        .insert(tickets)
        .values(ticketValues)
        .returning({ id: tickets.id });

      ticketId = created.id;
    }

    serverAnalytics.capture("payment_screenshot_uploaded", session.user.id, {
      ticket_id: ticketId,
      ticket_type: data.ticketType,
      payment_method: data.paymentMethod,
      amount_piastres: breakdown.finalPrice,
    });

    if (breakdown.couponId && !existingTicket?.couponId) {
      await db
        .update(coupons)
        .set({
          usedCount: sql`${coupons.usedCount} + 1`,
          updatedAt: now,
        })
        .where(eq(coupons.id, breakdown.couponId));
    }

    notifyTicketSubmitted({
      ticketId,
      attendeeName: user.fullName ?? user.email,
      attendeeEmail: user.email,
      packageName: "Regular Package",
      pricePaid: breakdown.finalPrice,
      paymentMethod: data.paymentMethod,
    });

    return {
      success: true,
      data: { ticketId, status: "payment_submitted" },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getMyTicket(): Promise<
  ActionResponse<MyTicketData | null> | ErrorResponse
> {
  const validationResult = await action({ authorize: true });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const session = validationResult.session!;

  try {
    await assertUserIsActive(session.user.id);

    const [row] = await db
      .select({
        ticket: tickets,
        fullName: users.fullName,
        email: users.email,
        order: orders,
      })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .leftJoin(orders, eq(tickets.orderId, orders.id))
      .where(
        and(
          eq(tickets.userId, session.user.id),
          or(eq(tickets.status, "confirmed"), eq(tickets.status, "checked_in")),
        ),
      )
      .limit(1);

    if (!row) {
      return { success: true, data: null };
    }

    serverAnalytics.capture("ticket_viewed", session.user.id, {
      ticket_id: row.ticket.id,
      ticket_type: row.ticket.type,
    });

    return {
      success: true,
      data: {
        ticket: row.ticket,
        user: { fullName: row.fullName, email: row.email },
        order: row.order
          ? {
              packageName: row.order.packageName,
              promoCode: row.order.promoCode,
              originalAmountPiastres: row.order.originalAmountPiastres,
              discountPiastres: row.order.discountPiastres,
            }
          : null,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function listTickets(params: TicketListInput): Promise<
  | ActionResponse<{
      items: TicketWithRelations[];
      total: number;
      page: number;
      pageSize: number;
    }>
  | ErrorResponse
> {
  const validationResult = await action<TicketListInput>({
    params,
    schema: TicketListSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await requireAdminSession();
    const { status, search, page, pageSize } =
      validationResult.params as TicketListInput;

    const conditions = [];

    if (status !== "all") {
      conditions.push(eq(tickets.status, status));
    }

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(users.email, term),
          ilike(tickets.paymentSenderName, term),
          ilike(tickets.paymentSenderPhone, term),
          ilike(tickets.paymentTransactionRef, term),
        ),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .where(whereClause);

    const rows = await db
      .select({
        ticket: tickets,
        user: {
          fullName: users.fullName,
          email: users.email,
          phone: users.phone,
        },
      })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .where(whereClause)
      .orderBy(desc(tickets.paymentSubmittedAt), desc(tickets.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const items: TicketWithRelations[] = rows.map((row) => ({
      ...row.ticket,
      user: row.user,
    }));

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

export async function reviewTicket(
  params: TicketReviewInput,
): Promise<
  ActionResponse<{ ticketId: string; status: string }> | ErrorResponse
> {
  const validationResult = await action<TicketReviewInput>({
    params,
    schema: TicketReviewSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const { session } = await requireAdminSession();
    // const session = await requireAdmin();
    const {
      ticketId,
      action: reviewAction,
      rejectionReason,
    } = validationResult.params as TicketReviewInput;

    const [ticketRow] = await db
      .select({
        ticket: tickets,
        email: users.email,
        fullName: users.fullName,
        order: orders,
      })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .leftJoin(orders, eq(tickets.orderId, orders.id))
      .where(eq(tickets.id, ticketId))
      .limit(1);

    if (!ticketRow) {
      return handleError(new NotFoundError("Ticket")) as ErrorResponse;
    }

    const { ticket, order } = ticketRow;

    if (ticket.status !== "payment_submitted") {
      return handleError(
        new ValidationError({
          status: ["Only tickets awaiting review can be approved or rejected"],
        }),
      ) as ErrorResponse;
    }

    const now = new Date();

    if (reviewAction === "approve") {
      await db
        .update(tickets)
        .set({
          status: "confirmed",
          reviewedBy: session.user.id,
          reviewedAt: now,
          rejectionReason: null,
          updatedAt: now,
        })
        .where(eq(tickets.id, ticketId));

      if (ticket.offerId) {
        await db
          .update(offers)
          .set({
            remainingSlots: sql`CASE WHEN ${offers.remainingSlots} IS NOT NULL THEN ${offers.remainingSlots} - 1 ELSE NULL END`,
            updatedAt: now,
          })
          .where(
            and(
              eq(offers.id, ticket.offerId),
              sql`${offers.remainingSlots} IS NOT NULL`,
            ),
          );
      }

      // Use package name from order if available, otherwise fall back to ticket type
      const packageName =
        order?.packageName ??
        (ticket.type === "general"
          ? "Regular Package"
          : `${ticket.type.toUpperCase()} Package`);

      notifyTicketConfirmed({
        ticketId,
        attendeeName: ticketRow.fullName ?? ticketRow.email,
        attendeeEmail: ticketRow.email,
        packageName,
        pricePaid: ticket.pricePaid,
        qrCode: ticket.qrCode,
      });

      serverAnalytics.capture("payment_approved", ticket.userId, {
        ticket_id: ticketId,
        ticket_type: ticket.type,
        amount_piastres: ticket.pricePaid,
      });
      serverAnalytics.capture("admin_payment_approved", session.user.id, {
        ticket_id: ticketId,
        ticket_type: ticket.type,
        amount_piastres: ticket.pricePaid,
        admin_id: session.user.id,
      });
      serverAnalytics.capture("ticket_purchased", ticket.userId, {
        ticket_id: ticketId,
        ticket_type: ticket.type,
        amount_piastres: ticket.pricePaid,
        coupon_used: !!ticket.couponId,
        offer_used: !!ticket.offerId,
        payment_method: ticket.paymentMethod as
          | "cash"
          | "instapay"
          | "bank_transfer",
      });

      return {
        success: true,
        data: { ticketId, status: "confirmed" },
      };
    }

    await db
      .update(tickets)
      .set({
        status: "rejected",
        reviewedBy: session.user.id,
        reviewedAt: now,
        rejectionReason: rejectionReason ?? null,
        updatedAt: now,
      })
      .where(eq(tickets.id, ticketId));

    // Use package name from order if available, otherwise fall back to ticket type
    const packageName =
      order?.packageName ??
      (ticket.type === "general"
        ? "Regular Package"
        : `${ticket.type.toUpperCase()} Package`);

    notifyTicketRejected({
      ticketId,
      attendeeName: ticketRow.fullName ?? ticketRow.email,
      attendeeEmail: ticketRow.email,
      packageName,
      pricePaid: ticket.pricePaid,
      rejectionReason: rejectionReason ?? null,
    });

    serverAnalytics.capture("payment_rejected", ticket.userId, {
      ticket_id: ticketId,
      ticket_type: ticket.type,
      reason: rejectionReason ?? undefined,
    });
    serverAnalytics.capture("admin_payment_rejected", session.user.id, {
      ticket_id: ticketId,
      reason: rejectionReason ?? undefined,
      admin_id: session.user.id,
    });

    return {
      success: true,
      data: { ticketId, status: "rejected" },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function checkInTicket(params: CheckInInput): Promise<
  | ActionResponse<{
      ticketId: string;
      attendeeName: string | null;
      alreadyCheckedIn?: boolean;
    }>
  | ErrorResponse
> {
  const validationResult = await action<CheckInInput>({
    params,
    schema: CheckInSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const { session } = await requireAdminSession();
    const { qrCode } = validationResult.params as CheckInInput;

    const now = new Date();

    // Atomic conditional update: only update if status is "confirmed"
    const [updated] = await db
      .update(tickets)
      .set({
        status: "checked_in",
        checkedInAt: now,
        checkedInBy: session.user.id,
        updatedAt: now,
      })
      .where(and(eq(tickets.qrCode, qrCode), eq(tickets.status, "confirmed")))
      .returning({ id: tickets.id });

    if (updated) {
      // Newly checked in - fetch attendee name for response
      const [row] = await db
        .select({
          fullName: users.fullName,
        })
        .from(tickets)
        .innerJoin(users, eq(tickets.userId, users.id))
        .where(eq(tickets.id, updated.id))
        .limit(1);

      return {
        success: true,
        data: {
          ticketId: updated.id,
          attendeeName: row?.fullName ?? null,
          alreadyCheckedIn: false,
        },
      };
    }

    // Update didn't happen - re-fetch to determine why
    const [row] = await db
      .select({
        ticket: tickets,
        fullName: users.fullName,
      })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .where(eq(tickets.qrCode, qrCode))
      .limit(1);

    if (!row) {
      return handleError(new NotFoundError("Ticket")) as ErrorResponse;
    }

    // Handle already checked-in tickets
    if (row.ticket.status === "checked_in") {
      return {
        success: true,
        data: {
          ticketId: row.ticket.id,
          attendeeName: row.fullName,
          alreadyCheckedIn: true,
        },
      };
    }

    // Wrong status
    return handleError(
      new ValidationError({
        status: [
          "Ticket must be confirmed before check-in. Current status: " +
            row.ticket.status,
        ],
      }),
    ) as ErrorResponse;
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getTicketById(
  ticketId: string,
): Promise<ActionResponse<TicketWithRelations | null> | ErrorResponse> {
  try {
    await requireAdminSession();

    const [row] = await db
      .select({
        ticket: tickets,
        user: {
          fullName: users.fullName,
          email: users.email,
          phone: users.phone,
        },
      })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .where(eq(tickets.id, ticketId))
      .limit(1);

    if (!row) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: { ...row.ticket, user: row.user },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
