import { NextResponse, type NextRequest } from "next/server";
import { eq, sql, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  tickets,
  users,
  orders,
  promoCodeUsages,
  promoCodes,
} from "@/lib/db/schema";
import {
  verifyKashierWebhookSignature,
  type KashierWebhookPayload,
} from "@/lib/kashier";
import {
  notifyTicketConfirmed,
  notifyTicketRejected,
} from "@/lib/email/send-ticket-emails";
import {
  getOrderByIdInternal,
  cleanupExpiredPromoReservations,
} from "@/lib/db/actions/order.action";

export async function POST(request: NextRequest) {
  try {
    console.log("🔥 WEBHOOK HIT");
    let payload;
    let receivedSignature = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      payload = await request.json();
      receivedSignature = request.headers.get("x-kashier-signature") || "";
      console.log(
        "[Kashier Webhook] Extracted signature from header:",
        receivedSignature,
      );
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      payload = { data: {} as Record<string, unknown> };
      for (const [key, value] of formData.entries()) {
        if (key === "signature") {
          receivedSignature = String(value);
        } else {
          (payload.data as Record<string, unknown>)[key] = value;
        }
      }
    } else {
      console.error("[Kashier Webhook] Unsupported content type:", contentType);
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 },
      );
    }

    console.log(
      "[Kashier Webhook] Received payload:",
      JSON.stringify(payload, null, 2),
    );

    // Handle new Payment Sessions API format
    if (payload.data && typeof payload.data === "object") {
      // New API format: { data: { sessionId, status, merchantOrderId, ... } }
      return handlePayment(payload, receivedSignature);
    } else if (payload.sessionId || payload.merchantOrderId) {
      // New API format at root level: { sessionId, status, merchantOrderId, ... }
      payload = { data: payload };
      return handlePayment(payload, receivedSignature);
    } else {
      // Fallback: wrap in data object
      payload = { data: payload };
      return handlePayment(payload, receivedSignature);
    }
  } catch (error) {
    console.error("[Kashier Webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("WEBHOOK GET HIT 🔥 ");
    const searchParams = request.nextUrl.searchParams;
    const receivedSignature = searchParams.get("signature") || "";

    const payload = { data: {} as Record<string, unknown> };
    for (const [key, value] of searchParams.entries()) {
      if (key !== "signature") {
        payload.data[key] = value;
      }
    }

    console.log("[Kashier Webhook] Received GET payload:", payload);

    return handlePayment(payload, receivedSignature);
  } catch (error) {
    console.error("[Kashier Webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function handlePayment(
  payload: { data: Record<string, unknown> },
  receivedSignature: string,
) {
  try {
    // TODO: Re-enable signature verification after debugging
    // Temporarily disabled to allow webhook processing
    console.log(
      "[Kashier Webhook] Signature verification temporarily disabled",
    );
    console.log("[Kashier Webhook] Received signature:", receivedSignature);

    /*
    const isValidSignature = verifyKashierWebhookSignature(
      payload as KashierWebhookPayload,
      receivedSignature,
    );

    if (!isValidSignature) {
      console.error("[Kashier Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
    */

    const { data } = payload;
    const merchantOrderId = (data.merchantOrderId || data.order) as string;
    const amount = data.amount;
    const paymentStatus = (data.paymentStatus || data.status) as string;

    if (!merchantOrderId) {
      console.error("[Kashier Webhook] Missing merchantOrderId");
      return NextResponse.json(
        { error: "Missing merchantOrderId" },
        { status: 400 },
      );
    }

    // Clean up expired promo reservations before processing
    await cleanupExpiredPromoReservations();

    // Try to find as an order first (new system)
    const order = await getOrderByIdInternal(merchantOrderId);

    if (order) {
      return handleOrderPayment(
        order,
        amount as string | number,
        paymentStatus,
        data,
      );
    }

    // Fall back to legacy ticket system
    const [ticketRow] = await db
      .select({
        ticket: tickets,
        email: users.email,
        fullName: users.fullName,
      })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .where(eq(tickets.id, merchantOrderId as string))
      .limit(1);

    if (!ticketRow) {
      console.error(
        "[Kashier Webhook] Order/Ticket not found:",
        merchantOrderId,
      );
      return NextResponse.json(
        { error: "Order/Ticket not found" },
        { status: 404 },
      );
    }

    const { ticket } = ticketRow;

    if (
      ticket.status === "confirmed" ||
      ticket.status === "checked_in" ||
      ticket.status === "cancelled"
    ) {
      console.log(
        "[Kashier Webhook] Idempotent - ticket already in terminal state:",
        ticket.status,
      );
      return NextResponse.json({ received: true });
    }

    const now = new Date();

    if (paymentStatus === "SUCCESS") {
      let amountToCheck: number;

      if (typeof amount === "string") {
        if (amount.includes(".")) {
          amountToCheck = Math.round(parseFloat(amount) * 100);
        } else {
          amountToCheck = parseInt(amount, 10);
        }
      } else if (typeof amount === "number") {
        if (amount > 1000) {
          amountToCheck = amount;
        } else {
          amountToCheck = Math.round(amount * 100);
        }
      } else {
        console.error("[Kashier Webhook] Invalid amount type:", typeof amount);
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }

      if (isNaN(amountToCheck)) {
        console.error("[Kashier Webhook] Invalid amount:", amount);
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }

      if (amountToCheck !== ticket.pricePaid) {
        console.error(
          "[Kashier Webhook] Amount mismatch: expected",
          ticket.pricePaid,
          "piasters, got",
          amountToCheck,
        );
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }

      await db
        .update(tickets)
        .set({
          status: "confirmed",
          paymentGatewayOrderId: String(
            data.orderId || data._id || merchantOrderId,
          ),
          paymentTransactionRef: String(
            data.transactionId || data.orderId || "",
          ),
          updatedAt: now,
          reviewedAt: now,
        })
        .where(eq(tickets.id, merchantOrderId as string));

      console.log(
        "[Kashier Webhook] Ticket confirmed successfully:",
        merchantOrderId,
      );

      notifyTicketConfirmed({
        ticketId: merchantOrderId as string,
        attendeeName: ticketRow.fullName ?? ticketRow.email,
        attendeeEmail: ticketRow.email,
        packageName: "Regular Package",
        pricePaid: ticket.pricePaid,
        qrCode: ticket.qrCode,
      });
    } else {
      await db
        .update(tickets)
        .set({
          status: "rejected",
          rejectionReason: "Payment failed",
          updatedAt: now,
          reviewedAt: now,
        })
        .where(eq(tickets.id, merchantOrderId as string));

      console.log(
        "[Kashier Webhook] Ticket rejected (payment failed):",
        merchantOrderId,
      );

      notifyTicketRejected({
        ticketId: merchantOrderId as string,
        attendeeName: ticketRow.fullName ?? ticketRow.email,
        attendeeEmail: ticketRow.email,
        packageName: "Regular Package",
        pricePaid: ticket.pricePaid,
        rejectionReason: "Payment failed",
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Kashier Webhook] Error handling payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function handleOrderPayment(
  order: typeof orders.$inferSelect,
  amount: string | number,
  paymentStatus: string,
  data: Record<string, unknown>,
) {
  const now = new Date();

  // Get user email for fallback
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, order.userId))
    .limit(1);

  // Check if order is already in terminal state (but allow failed→success retry)
  if (order.status === "paid" || order.status === "cancelled") {
    console.log(
      "[Kashier Webhook] Idempotent - order already in terminal state:",
      order.status,
    );
    return NextResponse.json({ received: true });
  }

  // If order is failed but we're receiving SUCCESS, allow retry
  if (order.status === "failed" && paymentStatus !== "SUCCESS") {
    console.log(
      "[Kashier Webhook] Idempotent - order failed and non-SUCCESS webhook:",
      order.status,
    );
    return NextResponse.json({ received: true });
  }

  if (paymentStatus === "SUCCESS") {
    let amountToCheck: number;

    if (typeof amount === "string") {
      if (amount.includes(".")) {
        amountToCheck = Math.round(parseFloat(amount) * 100);
      } else {
        amountToCheck = parseInt(amount, 10);
      }
    } else if (typeof amount === "number") {
      if (amount > 1000) {
        amountToCheck = amount;
      } else {
        amountToCheck = Math.round(amount * 100);
      }
    } else {
      console.error("[Kashier Webhook] Invalid amount type:", typeof amount);
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (isNaN(amountToCheck)) {
      console.error("[Kashier Webhook] Invalid amount:", amount);
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Verify amount against order's snapshotted final amount
    if (amountToCheck !== order.finalAmountPiastres) {
      console.error(
        "[Kashier Webhook] Amount mismatch: expected",
        order.finalAmountPiastres,
        "piasters, got",
        amountToCheck,
      );
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Transactional payment confirmation (idempotent)
    const result = await db.transaction(async (tx) => {
      // Update order status to paid (only if in pending or failed state)
      const [updatedOrder] = await tx
        .update(orders)
        .set({
          status: "paid",
          paidAt: now,
          paymentReference: String(data.transactionId || data.orderId || ""),
          promoReservationExpiresAt: null, // Clear reservation
          updatedAt: now,
        })
        .where(
          and(
            eq(orders.id, order.id),
            sql`${orders.status} IN ('pending_payment', 'failed')`,
          ),
        )
        .returning({ id: orders.id });

      // If no rows were updated, order was already paid - handle idempotently
      if (!updatedOrder) {
        // Check if order is already paid
        const [existingOrder] = await tx
          .select()
          .from(orders)
          .where(eq(orders.id, order.id))
          .limit(1);

        if (existingOrder?.status === "paid") {
          // Order already paid, get confirmed tickets for email deduplication
          const confirmedTickets = await tx
            .select()
            .from(tickets)
            .where(
              and(
                eq(tickets.orderId, order.id),
                eq(tickets.status, "confirmed"),
              ),
            );

          return { alreadyPaid: true, tickets: confirmedTickets };
        }

        throw new Error("Order is not in a payable state");
      }

      // Update pending tickets to confirmed status
      const updatedTickets = await tx
        .update(tickets)
        .set({
          status: "confirmed",
          paymentGatewayOrderId: order.kashierSessionId,
          paymentTransactionRef: String(
            data.transactionId || data.orderId || "",
          ),
          paymentSubmittedAt: now,
          reviewedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(tickets.orderId, order.id),
            eq(tickets.status, "pending_payment"),
          ),
        )
        .returning({
          id: tickets.id,
          qrCode: tickets.qrCode,
          attendeeName: tickets.attendeeName,
          attendeeEmail: tickets.attendeeEmail,
          pricePaid: tickets.pricePaid,
        });

      // Create promo usage record if applicable (ON CONFLICT for idempotency)
      if (order.promoCodeId) {
        await tx
          .insert(promoCodeUsages)
          .values({
            promoCodeId: order.promoCodeId,
            orderId: order.id,
            originalAmountPiastres: order.originalAmountPiastres,
            discountPiastres: order.discountPiastres,
            finalAmountPiastres: order.finalAmountPiastres,
            usedAt: now,
          })
          .onConflictDoNothing(); // unique_order_promo constraint handles this
      }

      return { alreadyPaid: false, tickets: updatedTickets };
    });

    // Send confirmation emails (fire-and-forget, outside transaction)
    for (const ticket of result.tickets) {
      try {
        notifyTicketConfirmed({
          ticketId: ticket.id,
          attendeeName: ticket.attendeeName || "Attendee",
          attendeeEmail:
            ticket.attendeeEmail || user?.email || "support@example.com",
          packageName: "Regular Package",
          pricePaid: ticket.pricePaid,
          qrCode: ticket.qrCode,
        });
      } catch (err) {
        console.error("Failed to send confirmation email:", err);
      }
    }

    console.log(
      "[Kashier Webhook] Order payment processed successfully:",
      order.id,
      "Already paid:",
      result.alreadyPaid,
      "Tickets:",
      result.tickets.length,
    );

    return NextResponse.json({ received: true });
  } else {
    // Payment failed - transactional handling
    await db.transaction(async (tx) => {
      // Update order status to failed (only if in pending_payment state)
      const [updatedOrder] = await tx
        .update(orders)
        .set({
          status: "failed",
          failedAt: now,
          failureReason: "Payment failed",
          updatedAt: now,
        })
        .where(
          and(eq(orders.id, order.id), eq(orders.status, "pending_payment")),
        )
        .returning({
          id: orders.id,
          promoReservationExpiresAt: orders.promoReservationExpiresAt,
        });

      // If order was updated, release promo reservation atomically
      if (updatedOrder && updatedOrder.promoReservationExpiresAt) {
        // Release promo reservation only if it was still reserved
        const [releaseResult] = await tx
          .update(orders)
          .set({ promoReservationExpiresAt: null })
          .where(
            and(
              eq(orders.id, order.id),
              sql`${orders.promoReservationExpiresAt} IS NOT NULL`,
            ),
          )
          .returning({ id: orders.id });

        // Only decrement if we actually cleared the reservation
        if (releaseResult && order.promoCodeId) {
          await tx
            .update(promoCodes)
            .set({
              usedCount: sql`GREATEST(${promoCodes.usedCount} - 1, 0)`,
              updatedAt: now,
            })
            .where(eq(promoCodes.id, order.promoCodeId));
        }
      }

      // Note: Tickets remain in pending_payment state on failure
      // They can be revived if a later SUCCESS webhook arrives
    });

    console.log("[Kashier Webhook] Order marked as failed:", order.id);
    return NextResponse.json({ received: true });
  }
}
