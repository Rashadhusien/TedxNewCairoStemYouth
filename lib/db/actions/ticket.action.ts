"use server";

import { and, desc, eq, ilike, ne, or, sql } from "drizzle-orm";

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
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/http-errors";
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
import { coupons, offers, tickets, users } from "../schema";
import type { Ticket } from "../schema";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    throw new ForbiddenError("Admin access required");
  }
  return session;
}

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

  try {
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

    const activeOffers = await db
      .select()
      .from(offers)
      .where(eq(offers.isActive, true));

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
      ticketType: data.ticketType,
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
    const [row] = await db
      .select({
        ticket: tickets,
        fullName: users.fullName,
        email: users.email,
      })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .where(
        and(
          eq(tickets.userId, session.user.id),
          ne(tickets.status, "cancelled"),
        ),
      )
      .orderBy(desc(tickets.createdAt))
      .limit(1);

    if (!row) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        ticket: row.ticket,
        user: { fullName: row.fullName, email: row.email },
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
    await requireAdmin();
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
    const session = await requireAdmin();
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
      })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .where(eq(tickets.id, ticketId))
      .limit(1);

    if (!ticketRow) {
      return handleError(new NotFoundError("Ticket")) as ErrorResponse;
    }

    const { ticket } = ticketRow;

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

      notifyTicketConfirmed({
        ticketId,
        attendeeName: ticketRow.fullName ?? ticketRow.email,
        attendeeEmail: ticketRow.email,
        ticketType: ticket.type,
        pricePaid: ticket.pricePaid,
        qrCode: ticket.qrCode,
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

    notifyTicketRejected({
      ticketId,
      attendeeName: ticketRow.fullName ?? ticketRow.email,
      attendeeEmail: ticketRow.email,
      ticketType: ticket.type,
      pricePaid: ticket.pricePaid,
      rejectionReason: rejectionReason ?? null,
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
    const session = await requireAdmin();
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
    await requireAdmin();

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
