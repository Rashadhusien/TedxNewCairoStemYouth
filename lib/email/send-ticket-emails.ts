import QRCode from "qrcode";

import { ROUTES } from "@/constants/routes";
import logger from "@/lib/logger";
import {
  formatPiastres,
  TICKET_TIERS,
  type PurchasableTicketType,
} from "@/lib/pricing";

import { getAppUrl } from "./app-url";
import { escapeHtml } from "./escape-html";
import { getAdminNotificationEmails } from "./get-admin-emails";
import { getResendClient } from "./resend";

type TicketEmailContext = {
  ticketId: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketType: string;
  pricePaid: number;
  qrCode?: string;
  paymentMethod?: string | null;
  rejectionReason?: string | null;
};

function getTierLabel(ticketType: string): string {
  if (ticketType in TICKET_TIERS) {
    return TICKET_TIERS[ticketType as PurchasableTicketType].label;
  }
  return ticketType.toUpperCase();
}

function ticketEmailShell(title: string, bodyHtml: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <div style="background: #111; color: #fff; padding: 20px 24px;">
        <p style="margin: 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #e62b1e;">TEDxNewCairoSTEMYouth</p>
        <h1 style="margin: 8px 0 0; font-size: 22px;">${escapeHtml(title)}</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #eee; border-top: none;">
        ${bodyHtml}
      </div>
      <p style="font-size: 12px; color: #666; text-align: center; padding: 16px;">
        Luminous Darkness 2026 · TEDxNewCairoSTEMYouth
      </p>
    </div>
  `;
}

async function sendEmail(params: {
  to: string[];
  subject: string;
  html: string;
  idempotencyKey: string;
  tags: { name: string; value: string }[];
  attachments?: { filename: string; content: Buffer }[];
}) {
  const from = process.env.EMAIL_FROM;
  const resend = getResendClient();

  if (!resend || !from) {
    if (process.env.NODE_ENV === "development") {
      logger.info(
        { to: params.to, subject: params.subject },
        "[dev] Ticket email (set RESEND_API_KEY and EMAIL_FROM to send for real)",
      );
      return;
    }
    throw new Error(
      "Email service is not configured. Set RESEND_API_KEY and EMAIL_FROM.",
    );
  }

  const { data, error } = await resend.emails.send(
    {
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      tags: params.tags,
      attachments: params.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
      })),
    },
    { idempotencyKey: params.idempotencyKey },
  );

  if (error) {
    logger.error(
      { err: error, to: params.to, subject: params.subject },
      "Failed to send ticket email",
    );
    throw new Error(error.message);
  }

  logger.info(
    { emailId: data?.id, to: params.to, subject: params.subject },
    "Ticket email sent",
  );
}

export async function sendTicketSubmittedAdminEmail(ctx: TicketEmailContext) {
  const adminEmails = await getAdminNotificationEmails();
  if (!adminEmails.length) {
    logger.warn("No admin notification emails configured — skipping admin alert");
    return;
  }

  const appUrl = getAppUrl();
  const reviewUrl = `${appUrl}${ROUTES.ADMIN.TICKETS}`;
  const tierLabel = getTierLabel(ctx.ticketType);
  const name = escapeHtml(ctx.attendeeName);
  const email = escapeHtml(ctx.attendeeEmail);
  const method = escapeHtml(ctx.paymentMethod ?? "—");

  const html = ticketEmailShell(
    "New ticket payment submitted",
    `
      <p>A new ticket payment is awaiting your review.</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 8px 0; color: #666;">Attendee</td><td style="padding: 8px 0;"><strong>${name}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;">${email}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Tier</td><td style="padding: 8px 0;">${escapeHtml(tierLabel)}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Amount</td><td style="padding: 8px 0;">${escapeHtml(formatPiastres(ctx.pricePaid))}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Payment method</td><td style="padding: 8px 0;">${method}</td></tr>
      </table>
      <p style="margin-top: 24px;">
        <a href="${reviewUrl}" style="display: inline-block; background: #e62b1e; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 4px; font-weight: bold;">
          Review in admin panel
        </a>
      </p>
    `,
  );

  await sendEmail({
    to: adminEmails,
    subject: `[TEDx] New ticket submission — ${ctx.attendeeName}`,
    html,
    idempotencyKey: `ticket-submitted-admin-${ctx.ticketId}`,
    tags: [{ name: "category", value: "ticket_submitted_admin" }],
  });
}

export async function sendTicketConfirmedAttendeeEmail(ctx: TicketEmailContext) {
  if (!ctx.qrCode) {
    throw new Error("QR code is required for confirmed ticket email");
  }

  const appUrl = getAppUrl();
  const myTicketUrl = `${appUrl}${ROUTES.MY_TICKET}`;
  const tierLabel = getTierLabel(ctx.ticketType);
  const name = escapeHtml(ctx.attendeeName);
  const qrBuffer = await QRCode.toBuffer(ctx.qrCode, {
    width: 280,
    margin: 2,
    type: "png",
  });

  const html = ticketEmailShell(
    "Your ticket is confirmed!",
    `
      <p>Hi ${name},</p>
      <p>Great news — your payment has been approved and your ticket for <strong>Luminous Darkness 2026</strong> is confirmed.</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #666;">Tier</td><td style="padding: 8px 0;"><strong>${escapeHtml(tierLabel)}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Amount paid</td><td style="padding: 8px 0;">${escapeHtml(formatPiastres(ctx.pricePaid))}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Ticket ID</td><td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${escapeHtml(ctx.qrCode)}</td></tr>
      </table>
      <p>Your QR code is attached to this email. Present it at the venue entrance on event day.</p>
      <p style="margin-top: 24px;">
        <a href="${myTicketUrl}" style="display: inline-block; background: #e62b1e; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 4px; font-weight: bold;">
          View my ticket online
        </a>
      </p>
    `,
  );

  await sendEmail({
    to: [ctx.attendeeEmail],
    subject: "Your TEDx ticket is confirmed — Luminous Darkness 2026",
    html,
    idempotencyKey: `ticket-confirmed-${ctx.ticketId}`,
    tags: [{ name: "category", value: "ticket_confirmed" }],
    attachments: [
      {
        filename: `tedx-ticket-${ctx.qrCode.slice(0, 8)}.png`,
        content: qrBuffer,
      },
    ],
  });
}

export async function sendTicketRejectedAttendeeEmail(ctx: TicketEmailContext) {
  const appUrl = getAppUrl();
  const myTicketUrl = `${appUrl}${ROUTES.MY_TICKET}`;
  const tierLabel = getTierLabel(ctx.ticketType);
  const name = escapeHtml(ctx.attendeeName);
  const reason = escapeHtml(ctx.rejectionReason?.trim() || "No reason provided.");

  const html = ticketEmailShell(
    "Payment not accepted",
    `
      <p>Hi ${name},</p>
      <p>We reviewed your payment proof for the <strong>${escapeHtml(tierLabel)}</strong> ticket, but we were unable to confirm it.</p>
      <div style="background: #fef2f2; border-left: 4px solid #e62b1e; padding: 12px 16px; margin: 16px 0;">
        <p style="margin: 0; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>
      </div>
      <p>You can upload a new payment screenshot from your ticket page and we'll review it again.</p>
      <p style="margin-top: 24px;">
        <a href="${myTicketUrl}" style="display: inline-block; background: #e62b1e; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 4px; font-weight: bold;">
          Resubmit payment proof
        </a>
      </p>
    `,
  );

  await sendEmail({
    to: [ctx.attendeeEmail],
    subject: "Action required — TEDx ticket payment not accepted",
    html,
    idempotencyKey: `ticket-rejected-${ctx.ticketId}`,
    tags: [{ name: "category", value: "ticket_rejected" }],
  });
}

/** Fire-and-forget wrapper — email failures must not block ticket actions. */
export function notifyTicketSubmitted(ctx: TicketEmailContext) {
  void sendTicketSubmittedAdminEmail(ctx).catch((error) => {
    logger.error({ err: error, ticketId: ctx.ticketId }, "Admin ticket alert failed");
  });
}

export function notifyTicketConfirmed(ctx: TicketEmailContext) {
  void sendTicketConfirmedAttendeeEmail(ctx).catch((error) => {
    logger.error({ err: error, ticketId: ctx.ticketId }, "Ticket confirmed email failed");
  });
}

export function notifyTicketRejected(ctx: TicketEmailContext) {
  void sendTicketRejectedAttendeeEmail(ctx).catch((error) => {
    logger.error({ err: error, ticketId: ctx.ticketId }, "Ticket rejected email failed");
  });
}
