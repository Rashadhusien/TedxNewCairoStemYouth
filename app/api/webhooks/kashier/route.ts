import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tickets, users } from "@/lib/db/schema";
import { verifyKashierWebhookSignature } from "@/lib/kashier";
import {
  notifyTicketConfirmed,
  notifyTicketRejected,
} from "@/lib/email/send-ticket-emails";

export async function POST(request: NextRequest) {
  try {
    let payload;
    let receivedSignature = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      payload = await request.json();
      receivedSignature = payload.signature || "";
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      payload = { data: {} as Record<string, any> };
      for (const [key, value] of formData.entries()) {
        if (key === "signature") {
          receivedSignature = String(value);
        } else {
          payload.data[key] = value;
        }
      }
    } else {
      console.error("[Kashier Webhook] Unsupported content type:", contentType);
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 },
      );
    }

    console.log("[Kashier Webhook] Received payload:", payload);

    if (!payload.data) {
      payload = { data: payload };
    }

    return handlePayment(payload, receivedSignature);
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
    const searchParams = request.nextUrl.searchParams;
    const receivedSignature = searchParams.get("signature") || "";

    const payload = { data: {} as Record<string, any> };
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

async function handlePayment(payload: any, receivedSignature: string) {
  try {
    const isValidSignature = verifyKashierWebhookSignature(
      payload,
      receivedSignature,
    );

    if (!isValidSignature) {
      console.error("[Kashier Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const { data } = payload;
    const merchantOrderId = data.merchantOrderId || data.order;
    const amount = data.amount;
    const paymentStatus = data.paymentStatus || data.status;

    if (!merchantOrderId) {
      console.error("[Kashier Webhook] Missing merchantOrderId");
      return NextResponse.json(
        { error: "Missing merchantOrderId" },
        { status: 400 },
      );
    }

    const [ticketRow] = await db
      .select({
        ticket: tickets,
        email: users.email,
        fullName: users.fullName,
      })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .where(eq(tickets.id, merchantOrderId))
      .limit(1);

    if (!ticketRow) {
      console.error("[Kashier Webhook] Ticket not found:", merchantOrderId);
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
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
          // Amount is in EGP, e.g. "300.00"
          amountToCheck = Math.round(parseFloat(amount) * 100);
        } else {
          // Amount is in piasters
          amountToCheck = parseInt(amount, 10);
        }
      } else if (typeof amount === "number") {
        if (amount > 1000) {
          // Amount is in piasters
          amountToCheck = amount;
        } else {
          // Amount is in EGP
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
        .where(eq(tickets.id, merchantOrderId));

      console.log(
        "[Kashier Webhook] Ticket confirmed successfully:",
        merchantOrderId,
      );

      notifyTicketConfirmed({
        ticketId: merchantOrderId,
        attendeeName: ticketRow.fullName ?? ticketRow.email,
        attendeeEmail: ticketRow.email,
        ticketType: ticket.type,
        pricePaid: ticket.pricePaid,
        qrCode: ticket.qrCode,
      });
    } else {
      //if (paymentStatus === "FAILED")
      await db
        .update(tickets)
        .set({
          status: "rejected",
          rejectionReason: "Payment failed",
          updatedAt: now,
          reviewedAt: now,
        })
        .where(eq(tickets.id, merchantOrderId));

      console.log(
        "[Kashier Webhook] Ticket rejected (payment failed):",
        merchantOrderId,
      );

      notifyTicketRejected({
        ticketId: merchantOrderId,
        attendeeName: ticketRow.fullName ?? ticketRow.email,
        attendeeEmail: ticketRow.email,
        ticketType: ticket.type,
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
